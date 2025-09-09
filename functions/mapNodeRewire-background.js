// FUNCTION TO REWIRE NODE ON MAP (AI)
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
    input {object, string} - map, nodeId
    RETURN void
*/

exports.handler = async (event) => {

    // Get map, nodeId
    const body = JSON.parse(event.body);
    const { map, nodeId } = body;
    if (!map || !nodeId) {
        log("WARNING", 'Invalid body @mapNodeRewire-background');
        return;
    }

    try {
        // Sanitize map
        const smallMap = sanitizeMap({map, type: "rewireNode"});
        // Deconstruct map
        const mapStr = deconstructMap(smallMap);

        // Set stages
        let stages = ["connectNode"];

        // Set user message
        let userMessage = "SELECTED NODE: " + nodeId + ".";

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
            log("DEBUG", `Asking AI @mapNodeRewire-background: ${stages[i]}`);
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
            log("ERROR", "Unable to parse response from AI @mapNodeRewire-background", response);
            map.creationStatus = 'failed';
            await mapUpdate(map);
            return;
        }

        // Check related links
        if (!jsonResponse.nodes || jsonResponse.nodes.length === 0) {
            log("WARNING", `No related connections found @mapNodeRewire-background" ${map.projectId}`);
            map.creationStatus = 'created';
            await mapUpdate(map);
            return;
        }

        const nodes = jsonResponse.nodes;

        // Replace all nodes related links
        for (let i=0; i<nodes.length; i++) {
            // Find node to replace on map
            const r = map.nodes.findIndex(n => n.nodeId === nodes[i].nodeId);
            // Replace related link on map
            map.nodes[r].relatedLink = nodes[i].relatedLink;
        }

        // Sanitize node links
        map = sanitizeMapLinks(map);

        // Update creation status
        map.creationStatus = 'created';

        // Update map
        const updatedMap = await mapUpdate(map);
        if (!updatedMap) {
            log("WARNING", 'Unable to update map @mapNodeRewire-background');
            return;
        }
        return;

    } catch (error) {
        log("ERROR", `Error in background node creation @mapNodeRewire-background for ${map.projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'failed';
        await mapUpdate(map);
    }
}
