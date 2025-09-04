// FUNCTION TO CREATE NEW NODE ON MAP
// No dependencies

// Functions
const generateToken = require('../utils/generateToken.jsx');
const deconstructMap = require('../utils/deconstructMap.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdated = require('./mapLastUpdated.jsx');

/* PARAMETERS
    input {object, string, string} - map, parendNodeId, query
    RETURN {object} - new node || null
*/

async function mapNodeCreate(map, parentId, query) {

    // Get parent settings
    const parentNodeLayer = map.nodes.find(n => n.nodeId === parentId).layer;
    const parentNodeColorScheme = map.nodes.find(n => n.nodeId === parentId).colorSchemeName;

    // Generate new node id
    const newNodeId = generateToken();

    // Deconstruct map
    const mapStr = deconstructMap(map);

    // Set stages
    let stage = ["createNode", "transformNodes"];

    // Set user message
    const nodeContent = map.nodes.find(n => n.nodeId === parentId).content;
    const nodeDetail = map.nodes.find(n => n.nodeId === parentId).detail;
    let userMessage = "Create one node. User query is " + query + ". Last thoughs are " + nodeContent + " and " + nodeDetail + ". ";

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
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Parse response
    const jsonResponse = parseJSON(response);
    if (!jsonResponse || jsonResponse.length === 0) {
        log("SERVER ERROR", "Unable to parse response from AI @mapNodeCreate", response);
        return null;
    }

    // Create new node
    let newNode = {
        nodeId: newNodeId,
        shortName: jsonResponse.nodes[0].shortName,
        content: jsonResponse.nodes[0].content,
        detail: jsonResponse.nodes[0].detail,
        directLink: [parentId],
        relatedLink: [],
        x: null,
        y: null,
        locked: false,
        approved: false,
        hidden: false,
        colorScheme: parentNodeColorScheme,
        nodeLayer: parentNodeLayer
    }
    // Push new node
    map.nodes.push(newNode);

    // Add new node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $push: { nodes: newNode } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to add new node on map @mapNodeAdd.");
    }

    // Last update
    const updatedMap = await mapLastUpdated(map);

    // Return
    return updatedMap;

}

module.exports = mapNodeCreate;