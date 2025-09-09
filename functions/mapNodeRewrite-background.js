// FUNCTION TO REWRTE NODE ON MAP (AI)
// No dependencies

// Functions
const sanitizeMap = require('./utils/sanitizeMap.jsx');
const deconstructMap = require('./utils/deconstructMap.jsx');
const getInstructionsTxt = require('./ai/getInstructionsTxt.jsx');
const constructConversation = require('./ai/constructConversation.jsx');
const askAIBridge = require('./ai/askAIBridge.jsx');
const parseJSON = require('./utils/parseJSON.jsx');
const sanitizeMapLinks = require('./utils/sanitizeMapLinks.jsx');
const mapUpdate = require('./controller/mapUpdate.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {object, string, string} - map, nodeId, query
    RETURN void
*/

exports.handler = async (event) => {

    // Get map, nodeId, query
    const body = JSON.parse(event.body);
    const { map, nodeId, query } = body;
    if (!map || !nodeId || !query) {
        log("WARNING", 'Invalid body @mapNodeRewrite-background');
        return;
    }

    try {
        // Sanitize map
        const smallMap = sanitizeMap({map, type: "rewriteNode"});
        // Deconstruct map
        const mapStr = deconstructMap(smallMap);

        // Set stages
        let stages = ["rewriteNode", "transformOneNode"];

        // Set user message
        const nodeContent = smallMap.nodes.find(n => n.nodeId === nodeId).content;
        const nodeDetail = smallMap.nodes.find(n => n.nodeId === nodeId).detail;
        let userMessage = "USER QUERY: " + query + ". SELECTED NODE: " + nodeId + ". LAST THOUGHTS: " + nodeContent + " " + nodeDetail + ".";

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
            log("DEBUG", `Asking AI @mapNodeRewrite-background: ${stages[i]}`);
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
            log("ERROR", "Unable to parse response from AI @mapNodeRewrite-background", response);
            map.creationStatus = 'failed';
            await mapUpdate(map);
            return;
        }

        // Replace node data (keep other features)
        const i = map.nodes.findIndex(n => n.nodeId === nodeId);
        map.nodes[i].shortName = jsonResponse.nodes[0].shortName;
        map.nodes[i].content = jsonResponse.nodes[0].content;
        map.nodes[i].detail = jsonResponse.nodes[0].detail;
        map.nodes[i].approved = false;
        map.nodes[i].hidden = false;
        
        // Sanitize map links
        map = sanitizeMapLinks(map);

        // Update creation status
        map.creationStatus = 'created';

        // Update map
        const updatedMap = await mapUpdate(map);
        if (!updatedMap) {
            log("WARNING", 'Unable to update map @mapNodeRewrite-background');
            return;
        }
        return;

    } catch (error) {
        log("ERROR", `Error in background node creation @mapNodeRewrite-background for ${map.projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'failed';
        await mapUpdate(map);
    }
}
