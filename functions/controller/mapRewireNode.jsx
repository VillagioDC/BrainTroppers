// FUNCTION TO REWIRE MAP
// No dependencies

// Functions
const deconstructMap = require('../utils/deconstructMap.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const mapUpdate = require('./mapUpdate.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - updated map
*/

async function mapRewireNode(map, nodeId) {

    // Deconstruct map
    const mapStr = deconstructMap(map);

    // Set stages
    const stage = ["nodeConnections"];

    // Set user message
    let userMessage = "Target `nodeId` is: " + nodeId + ". Review all `directLink` and `relatedLink` connections and update the arrays.";

    // Construct response
    let response = "";
    // Loop stages
    for (let i=0; i<stage.length; i++) {

        // Get instructions
        const instructions = await getInstructionsTxt(stage[i]) + 
                             (i === 0 ? ("\n" + "Full brainstorm map is: " + mapStr) : "");

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
        userMessage = await askAIBridge(conversation);

        // Response
        response = userMessage;

        // Pause if not last stage
        if (i < stage.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Parse response
    const jsonResponse = parseJSON(response);

    // Update map 
    let resultMap = jsonResponse;
    resultMap.projectId = map.projectId;
    resultMap.title = map.title;
    resultMap.lastUpdated = new Date(Date.now());
    resultMap.userPrompt = map.userPrompt;
    const updatedMap = await mapUpdate(resultMap);

    // Return
    return updatedMap;
}

module.exports = mapRewireNode;