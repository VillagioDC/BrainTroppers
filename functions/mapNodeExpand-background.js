// FUNCTION TO EXPAND NODE ON MAP (AI)
// No dependencies

// Functions
const sanitizeMap = require('./utils/sanitizeMap.jsx');
const deconstructMap = require('./utils/deconstructMap.jsx');
const getInstructionsTxt = require('./ai/getInstructionsTxt.jsx');
const constructConversation = require('./ai/constructConversation.jsx');
const askAIBridge = require('./ai/askAIBridge.jsx');
const parseJSON = require('./utils/parseJSON.jsx');
const mapUpdate = require('./controller/mapUpdate.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {object, string, string} - map, parentId, query
    RETURN void
*/

exports.handler = async (event) => {

    // Get map, parentId, query
    const body = JSON.parse(event.body);
    const { map, parentId, query } = body;
    if (!map || !parentId || !query) {
        log("WARNING", 'Invalid body @mapNodeExpand-background');
        return;
    }

    try {
        // Sanitize map
        const smallMap = sanitizeMap({map, type: "expandNode"});
        // Deconstruct map
        const mapStr = deconstructMap(smallMap);

        // Set stages
        let stages = ["expandNode", "transformNodes"];

        // Set user message
        const nodeContent = smallMap.nodes.find(n => n.nodeId === parentId).content;
        const nodeDetail = smallMap.nodes.find(n => n.nodeId === parentId).detail;
        let userMessage = "USER QUERY: " + query + ". SELECTED NODE: " + parentId + ". LAST THOUGHTS: " + nodeContent + " " + nodeDetail + ".";

        // Loop stages
        let response = "";
        for (let i=0; i<stages.length; i++) {

            // Get instructions
            const instructions = await getInstructionsTxt(stages[i]) + 
                                (i === 0 ? ("\n" + "BRAINSTORM MAP: " + mapStr) : "");

            // Set message
            const messages = [ 
                { speaker: "assistant",
                message: "i'll follow the instructions strickly" },
                { speaker: "user",
                message: userMessage}
            ];

            // Construct conversation
            const conversation = constructConversation(instructions, messages);        

            // Ask AI
            log("DEBUG", `Asking AI @mapNodeExpand-background: ${stages[i]}`);
            userMessage = await askAIBridge(conversation);

            // Response
            response = userMessage;

            // Pause if not last stage
            if (i < stages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Parse response
        const jsonResponse = parseJSON(response);
        if (!jsonResponse || jsonResponse.length === 0) {
            log("ERROR", "Unable to parse response from AI @mapNodeExpand-background", response);
            map.creationStatus = 'failed';
            await mapUpdate(map);
            return;
        }

        // New nodes
        const newNodes = jsonResponse.nodes || [];

        // Get parent settings
        const parentNodeMaximized = map.nodes.find(n => n.nodeId === parentId).maximized;
        const parentNodeColorSchemeName = map.nodes.find(n => n.nodeId === parentId).colorSchemeName;

        // Update map with new nodes
        let node = {};
        for (let i=0; i<newNodes.length; i++) {
            // Create new node
            node = {};
            node.nodeId = newNodes[i].nodeId;
            node.shortName = newNodes[i].shortName;
            node.content = newNodes[i].content;
            node.detail = newNodes[i].detail;
            node.directLink = [parentId];
            node.relatedLink = [];
            node.x = null;
            node.y = null;
            node.locked = false;
            node.approved = false;
            node.maximized = parentNodeMaximized;
            node.hidden = false;
            node.colorSchemeName = parentNodeColorSchemeName;
            // Push node
            map.nodes.push(node);
        }

        // Update parent node
        const p = map.nodes.findIndex(n => n.nodeId === parentId);
        for (let i=0; i<newNodes.length; i++) {
            map.nodes[p].directLink.push(newNodes[i].nodeId);
        }
        
        // Update creation status
        map.creationStatus = 'created';

        // Update map
        const updatedMap = await mapUpdate(map);
        if (!updatedMap) {
            log("WARNING", 'Unable to update map @mapNodeExpand-background');
            return;
        }
        return;

    } catch (error) {
        log("ERROR", `Error in background node creation @mapNodeExpand-background for ${map.projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'failed';
        await mapUpdate(map);
    }
}
