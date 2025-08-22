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

async function mapCreateNew(query) {

    // Generate  new map and add to database
    const newMap = await mapAddNew(query);

    // Set stages
    const stage = ["brainstorm", "transformer", "expand", "connections"];

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

        // Pause if not last stage
        if (i < stage.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Parse response
    const jsonResponse = parseJSON(response);

    // Update map 
    newMap.title = jsonResponse.title;
    newMap.nodes = jsonResponse.nodes;
    await mapUpdate(newMap);

    // Update user projects with new map
    await userAddNewMap(newMap, newMap.owner);

    // Return
    return newMap;
}

module.exports = mapCreateNew;