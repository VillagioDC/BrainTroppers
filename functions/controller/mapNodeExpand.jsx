// FUNCTION TO EXPAND NODE ON MAP
// No dependencies

// Functions
const deconstructMap = require('../utils/deconstructMap.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const mapRewire = require('./mapRewire.jsx');

/* PARAMETERES
    input {object, string, string} - map, parentNodeId, user query
    RETURN {object} - updated map
*/

async function mapNodeExpand(map, parentNodeId, query) {

    // Get parent node color scheme
    const parentNodeColorScheme = map.nodes.find(n => n.nodeId === parentNodeId).colorSchemeName;

    // Get parent node layer
    const parentNodeLayer = map.nodes.find(n => n.nodeId === parentNodeId).layer;

    // Deconstruct map
    const mapStr = deconstructMap(map);

    // Set stages
    let stage = ["expandNode", "transformNodes"];

    // Set user message
    const nodeContent = map.nodes.find(n => n.nodeId === parentNodeId).content;
    const nodeDetail = map.nodes.find(n => n.nodeId === parentNodeId).detail;
    let userMessage = "Expand node about " + nodeContent + "and " + nodeDetail + ". " + (query || "") + ". ";

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
    let node = {};
    for (let i=0; i<newNodes.length; i++) {
        // Create new node
        node = {};
        node.nodeId = newNodes[i].nodeId;
        node.shortName = newNodes[i].shortName;
        node.content = newNodes[i].content;
        node.detail = newNodes[i].detail;
        node.directLink = [parentNodeId];
        node.relatedLink = [];
        node.xy = null;
        node.hidden = false;
        node.colorSchemeName = parentNodeColorScheme;
        node.layer = parentNodeLayer;
        // Push node
        map.nodes.push(node);
    }

    // Rewire map
    const updatedMap = await mapRewire(map);

    // Return
    return updatedMap;
}

module.exports = mapNodeExpand;