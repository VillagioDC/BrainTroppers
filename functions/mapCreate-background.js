// BACKGROUND FUNCTION TO PROCESS MAP CREATION (AI)
// No dependencies

// Functions
const mapRead = require('./controller/mapRead.jsx');
const mapUpdate = require('./controller/mapUpdate.jsx');
const getInstructionsTxt = require('./ai/getInstructionsTxt.jsx');
const constructConversation = require('./ai/constructConversation.jsx');
const askAIBridge = require('./ai/askAIBridge.jsx');
const parseJSON = require('./utils/parseJSON.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {string} - projectId
    RETURN void
*/

exports.handler = async (event) => {

    // Get projectId
    const body = JSON.parse(event.body);
    const projectId = body.projectId || null;
    if (!projectId) {
        log('SERVER WARNING', 'Missing projectId @mapCreate-background', JSON.stringify(body));
        return;
    }

    // Fetch the map
    let map = await mapRead(projectId);
    if (!map) {
      log('SERVER ERROR', 'Project not found @mapCreate-background', projectId);
      return;
    }
    if (map.creationStatus !== 'requested') {
      log('SERVER WARNING', 'Map already processing @mapCreate-background:', map.creationStatus);
      return;
    }

    try {
        // Update to 'creating'
        map.creationStatus = 'creating';
        await mapUpdate(map);

        // Set stages
        const stages = ["brainstorm", "transformer"];

        // Set user message from stored prompt
        let userMessage = map.userPrompt;

        // Construct nodes via AI loop
        let response = "";
        for (let i = 0; i < stages.length; i++) {
            // Get instructions
            const instructions = await getInstructionsTxt(stages[i]);

            // Set messages
            const messages = [
                { speaker: "assistant", message: "i'll follow the instructions strickly" },
                { speaker: "user", message: userMessage }
            ];

            // Construct conversation
            const conversation = constructConversation(instructions, messages);

            // Ask AI
            log('SERVER DEBUG', `Asking AI @mapCreate-background: ${stages[i]}`);
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

        // Fill meta data
        map.title = jsonResponse.title;
        map.nodes = jsonResponse.nodes;
        map.creationStatus = 'created';
        map.lastUpdated = new Date(Date.now());

        // Fill nodes
        for (let i = 0; i < map.nodes.length; i++) {
            map.nodes[i].x = null;
            map.nodes[i].y = null;
            map.nodes[i].locked = false;
            map.nodes[i].approved = false;
            map.nodes[i].hidden = false;
            map.nodes[i].colorScheme = null;
            map.nodes[i].layer = 1;
        }

        // Update map
        await mapUpdate(map);
        return;

    } catch (error) {
        log('SERVER ERROR', `Error in background map creation for ${projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'failed';
        await mapUpdate(map);
    }
};