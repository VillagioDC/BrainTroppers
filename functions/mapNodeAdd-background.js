// FUNCTION TO ADD NEW NODE ON MAP (AI)
// No dependencies

// Functions
const sanitizeMap = require('./utils/sanitizeMap.jsx');
const deconstructMap = require('./utils/deconstructMap.jsx');
const getInstructionsTxt = require('./ai/getInstructionsTxt.jsx');
const constructConversation = require('./ai/constructConversation.jsx');
const askAIBridge = require('./ai/askAIBridge.jsx');
const parseJSON = require('./utils/parseJSON.jsx');
const generateToken = require('./utils/generateToken.jsx');
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
        log("WARNING", 'Invalid body @mapNodeAdd-background');
        return;
    }

    try {
        // Sanitize map
        const smallMap = sanitizeMap({map, type: "addNode"});
        // Deconstruct map
        const mapStr = deconstructMap(smallMap);

        // Set stages
        let stages = ["createNode", "transformOneNode"];

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
            log("DEBUG", `Asking AI @mapNodeAdd-background: ${stages[i]}`);
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
            log("ERROR", "Unable to parse response from AI @mapNodeAdd-background", response);
            map.creationStatus = 'failed';
            await mapUpdate(map);
            return;
        }

        // Generate new node id
        const newNodeId = generateToken();

        // Get parent settings
        const parentNodeMaximized = map.nodes.find(n => n.nodeId === parentId).maximized;
        const parentNodeColorSchemeName = map.nodes.find(n => n.nodeId === parentId).colorSchemeName;

        // Create new node
        let newNode = {
            nodeId: newNodeId,
            topic: jsonResponse.nodes[0].topic,
            content: jsonResponse.nodes[0].content,
            detail: jsonResponse.nodes[0].detail,
            directLink: [parentId],
            relatedLink: [],
            x: null,
            y: null,
            locked: false,
            approved: false,
            maximized: parentNodeMaximized,
            hidden: false,
            colorSchemeName: parentNodeColorSchemeName,
        }
        // Push new node
        map.nodes.push(newNode);

        // Update parent node
        const p = map.nodes.findIndex(n => n.nodeId === parentId);
        map.nodes[p].directLink.push(newNode.nodeId);
        
        // Update creation status
        map.creationStatus = 'created';

        // Update map
        const updatedMap = await mapUpdate(map);
        if (!updatedMap) {
            log("WARNING", 'Unable to update map @mapNodeAdd-background');
            return;
        }
        return;

    } catch (error) {
        log("ERROR", `Error in background node creation @mapNodeAdd-background for ${map.projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'failed';
        await mapUpdate(map);
    }
}
