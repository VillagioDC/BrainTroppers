// FUNCTION TO EXPAND NODE ON MAP
// No dependencies

// Functions
const deconstructMap = require('../utils/deconstructMap.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const mapRewire = require('./mapRewire.jsx');
const mapUpdate = require('./mapUpdate.jsx');

/* PARAMETERES
    input {object, string, string} - map, nodeId, user query
    RETURN {object} - updated map
*/

async function mapNodeExpand(map, nodeId, query) {

    // Deconstruct map
    const mapStr = deconstructMap(map);

    // Set stages
    let stage = ["expandNode", "transformNodes"];

    // Set user message
    const nodeContent = map.nodes.find(n => n.nodeId === nodeId).content;
    let userMessage = "Expand node " + nodeId + " about " + nodeContent + ". " + (query || "") + ". ";

    // Loop stages
    let response = "";
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

    // New nodes
    const newNodes = jsonResponse.nodes || [];

    // Update map with new nodes
    for (let i=0; i<newNodes.length; i++) {
        map.nodes.push(newNodes[i]);
    }

    // Reconnect map
    const updatedMap = await mapRewire(map);

    // Update map
    await mapUpdate(newMap);

    // Return
    return updatedMap;
}

module.exports = mapNodeExpand;