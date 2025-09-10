// FUNCTION TO CREATE DOCX MAP
// Dependencies
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs').promises;

// Functions
const log = require('../utils/log.jsx');

/* PARAMETERS
  input {map} - map
  RETURN {bool} - sourceFilepath || null
*/
async function createDocxMap(map) {

    // Check map
    if (!map || typeof map !== 'object' || !map.projectId || !map.nodes || map.nodes.length === 0) {
        log("ERROR", "Invalid input map @createDocMap.");
        return null;
    }

    // Prepare nodes index
    const nodesArray = map.nodes;
    const nodesById = new Map();
    nodesArray.forEach((n) => {
        if (n && typeof n.nodeId === 'string') nodesById.set(n.nodeId, n);
    });
    // Helper: build visited set
    const visited = new Set();

    // Helper: create a TextRun with optional gray color if hidden
    const buildTextRun = (text, nodeHidden = false, options = {}) => {
        const runOpts = Object.assign({}, options);
        if (nodeHidden) {
            runOpts.color = runOpts.color || "808080";
        }
        // Avoid creating empty runs
        const safeText = (typeof text === 'string' && text.length > 0) ? text : "";
        return new TextRun(Object.assign({ text: safeText }, runOpts));
    };

    // Build paragraphs list
    const paragraphs = [];

    // Add document title as Heading1
    const titleText = typeof map.title === 'string' && map.title.trim().length > 0 ? map.title.trim() : "Untitled Document";
    paragraphs.push(new Paragraph({
        children: [ buildTextRun(titleText, false, { bold: true }) ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
    }));

    // Create content for a single node, appended to paragraphs
    const appendNodeToDoc = (node) => {
        // Check hidden attribute
        const nodeHidden = !!node.hidden;

        // Topic title / subtitle = node.shortName
        const shortName = (typeof node.shortName === 'string' && node.shortName.trim().length) ? node.shortName.trim() : `(untitled ${node.nodeId})`;
        const headingLevel = nodeHidden ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1;
        paragraphs.push(new Paragraph({
            heading: headingLevel,
            children: [buildTextRun(shortName, nodeHidden, { bold: true })],
                spacing: { before: 80, after: 80},
        }));

        // First paragraph = node.content
        if (node.content && node.content.trim().length > 0) {
            paragraphs.push(new Paragraph({
                children: [buildTextRun(node.content, nodeHidden)],
                spacing: { before: 80, after: 80},
            }));
        }

        // Second paragraph = node.detail
        if (node.detail && node.detail.trim().length > 0) {
            paragraphs.push(new Paragraph({
                children: [buildTextRun(node.detail, nodeHidden)],
                spacing: { before: 80, after: 80},
            }));
        }

        // Notes = relatedLink names expanded
        const relatedIds = node.relatedLink;
        if (relatedIds.length > 0) {
            // Construct related link short names
            const relatedNames = relatedIds.map((rid) => {
                // Get node by id
                const rn = nodesById.get(rid);
                // Set short name
                if (rn && typeof rn.shortName === 'string') return rn.shortName.trim();
            });
            // Add note if any related link
            if (relatedNames.length > 0) {
                const noteText = `related to: ${relatedNames.join(', ')}`;
                paragraphs.push(new Paragraph({
                    children: [buildTextRun(noteText, nodeHidden, { italics: true, size: 18 })],
                    spacing: { before: 80, after: 80},
                }));
            }
        }
        // Add an empty paragraph
        paragraphs.push(new Paragraph({
                children: [ buildTextRun("", nodeHidden) ],
                spacing: { before: 80, after: 80},
        }));
    };

    // Depth-first traversal following directLink, then weak related nodes
    const traverse = (nodeId) => {
        // Get node
        const sid = nodeId;
        if (visited.has(sid)) return;
        const node = nodesById.get(sid);
        if (!node) return;

        // Mark visited and append node
        visited.add(sid);
        appendNodeToDoc(node);

        // 1) Traverse direct children (directLink)
        const directChildren = node.directLink;
        for (const childId of directChildren) {
            if (!childId) continue;
            // Prevent immediate duplication: check visited inside recursive call as well
            if (!visited.has(childId)) traverse(childId);
        }

        // 2) Insert weak nodes: relatedLink targets that have no directLink themselves
        const related = node.relatedLink;
        for (const relId of related) {
            if (visited.has(relId)) {
                // already in doc, skip
                continue;
            }
            const relNode = nodesById.get(relId);
            if (!relNode) continue;
            const relDirect = relNode.directLink;
            // If relNode has no directLink (or empty), treat as weak and insert as branch
            if (relDirect.length === 0) traverse(relId);
        }
    };

    // Start traversal from first node in map.nodes array
    if (nodesArray.length > 0) {
        const firstNode = nodesArray[0];
        if (!firstNode || typeof firstNode.nodeId === 'undefined') {
            // fallback: pick first node that has id
            const fallback = nodesArray.find((n) => n && typeof n.nodeId !== 'undefined');
            if (fallback) {
                traverse(fallback.nodeId);
            }
        } else {
            traverse(firstNode.nodeId);
        }
    }

    // After main traversal, add all nodes without directLink and relatedLink
    for (const node of nodesArray) {
        const nid = node.nodeId;
        // Skip already visited
        if (visited.has(nid)) continue;

        const hasDirect = (Array.isArray(node.directLink) && node.directLink.length > 0);
        const hasRelated = (Array.isArray(node.relatedLink) && node.relatedLink.length > 0);
        // If node has neither directLink nor relatedLink, append it at the end
        if (!hasDirect && !hasRelated) {
            appendNodeToDoc(node);
            visited.add(nid);
        }
    }

    // Append isolated nodes at the end of the document
    for (const node of nodesArray) {
        const nid = node.nodeId;
        if (visited.has(nid)) continue;
        appendNodeToDoc(node);
        visited.add(nid);
    }

    // Build Document
    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });

    // Construct source filepath
    const outputDir = './private/exportTemp';
    const fileName = map.title.trim().replace(/\s+/g, '_');
    const sourceFilepath = `${outputDir}/${fileName}.docx`;

    // Save document
    try {
        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(sourceFilepath, buffer);
    // Catch error
    } catch (error) {
        log("ERROR", `Failed to save DOCX file @createDocMap: ${error.message}`);
        return null;
    }

    // Return
    return sourceFilepath;
}

module.exports = createDocxMap;

/*
ROLE: 'docx' library expert;
ROLE: implement code;
TASKS:
1- analyze code and schema;
2- understand features;
3- understand 'docx' library;
4- develop the code in silence;
5- audit the code to make sure it follows 'docx', meets the features and works properly;
6- provide full code with comments and debug points (use log function as provided);
FEATURES:
1- create a DOCX file from input map;
2- doc has title (map.title);
3- each node is a topic;
4- if node is hidden, color it gray;
5- each topic has a sub title (node.shortName), first paragraph (node.content), second paragraph (node.detail) and note (node.relatedLink);
6- notes will be 'related to: ${node.shortName}, ...', where node.shortName is the title of each nodeId inside the relatedLink array;
7- first topic will be the first node in the map.nodes array (map.nodes[0]);
8- next topics must follow a tree-branch structure, conducted by directLink array;
9- nodes must check link to weak nodes that has only relatedLink and insert as its branch;
10- nodes may have bilateral links (1 to 3, 3 to 1, ...), so you must avoid duplication;
11- nodes without directLink and relatedLink will be placed at the end of the document;
12- ignore x, y, locked, colorScheme;
13- save DOCX file to already existing folder (done!)
OUTPUT: complete code with comments
*/