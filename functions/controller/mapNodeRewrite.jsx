// FUNCTION TO REWRITE NODE
// No dependencies

// Functions
const deconstructMap = require('../utils/deconstructMap.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const mapNodeUpdate = require('./mapNodeUpdate.jsx');
const mapRewire = require('./mapRewire.jsx');

/* PARAMETERES
    input {object, string, string} - map, nodeId, user query
    RETURN {object} - updated map
*/

async function mapNodeRewrite(map, nodeId, query) {

    // Deconstruct map
    const mapStr = deconstructMap(map);

    // Set stages
    let stage = ["reviewNode"];

    // Set user message
    const nodeContent = map.nodes.find(n => n.nodeId === nodeId).content;
    let userMessage = "Review node about " + nodeContent + ". " + (query || "") + ". ";

    // Construct response
    let response = "";
    // Loop stages
    for (let i=0; i<stage.length; i++) {

        // Get instructions
        const instructions = await getInstructionsTxt(stage[i]) + "\n" + "Full brainstorm map is: " + mapStr;

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

    // Update node
    let reviewNode = map.nodes.find(n => n.nodeId === nodeId);
    reviewNode.shortName = jsonResponse.shortName;
    reviewNode.content = jsonResponse.content;
    reviewNode.detail = jsonResponse.detail;
    reviewNode.hidden = false;

    // Update node
    const updatedNodeMap = await mapNodeUpdate(map, reviewNode);

    // Reconnect map
    const updatedMap = await mapRewire(updatedNodeMap);

    // Return
    return updatedMap;
}

module.exports = mapNodeRewrite;