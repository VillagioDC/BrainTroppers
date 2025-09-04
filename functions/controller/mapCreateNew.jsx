// FUNCTION TO CREATE NEW MAP
// No dependencies

// Functions
const mapAddNew = require('./mapAddNew.jsx');
const getInstructionsTxt = require('../ai/getInstructionsTxt.jsx');
const constructConversation = require('../ai/constructConversation.jsx');
const askAIBridge = require('../ai/askAIBridge.jsx');
const parseJSON = require('../utils/parseJSON.jsx');
const mapUpdate = require('./mapUpdate.jsx');

/* PARAMETERS
    input {string} - user query
    RETURN {object} - new map
*/

async function mapCreateNew({userId, query}) {

    // Generate  new map and add to database
    const newMap = await mapAddNew({userId, query});
    if (!newMap) return null;

    // Set stages
    const stage = ["brainstorm", "transformer", "parentNode"];

    // Set user message
    let userMessage = query;

    // Construct first nodes
    let response = "";
    // Loop stages
    for (let i=0; i<stage.length; i++) {

        // Get instructions
        const instructions = await getInstructionsTxt(stage[i]);

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

        console.log("Stage: " + stage[i]);
        console.log(response);

        // Pause if not last stage
        if (i < stage.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Parse response
    const jsonResponse = parseJSON(response);

    // Fill meta data 
    newMap.title = jsonResponse.title;
    newMap.nodes = jsonResponse.nodes;

    // Fill nodes
    for (let i=0; i<newMap.nodes.length; i++) {
        newMap.nodes[i].x = null;
        newMap.nodes[i].y = null
        newMap.nodes[i].locked = false;
        newMap.nodes[i].approved = false;
        newMap.nodes[i].hidden = false;
        newMap.nodes[i].parentNodeColorScheme = null;
        newMap.nodes[i].layer = 1;
    }

    // Update map
    const updatedMap = await mapUpdate(newMap);
    if (!updatedMap) return null;

    // Return
    return updatedMap;
}

module.exports = mapCreateNew;