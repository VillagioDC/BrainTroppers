// BACKGROUND FUNCTION TO PROCESS MAP CREATION (AI)
// No dependencies

// Functions
const mapRead = require('./controller/mapRead.jsx');
const mapUpdate = require('./controller/mapUpdate.jsx');
const getInstructionsTxt = require('./ai/getInstructionsTxt.jsx');
const constructConversation = require('./ai/constructConversation.jsx');
const askAIBridge = require('./ai/askAIBridge.jsx');
const parseJSON = require('./utils/parseJSON.jsx');
const sanitizeMapLinks = require('./utils/sanitizeMapLinks.jsx');
const userAssignMap = require('./controller/userAssignMap.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {string} - projectId
    RETURN void
*/

exports.handler = async (event) => {

    // Get projectId
    const body = JSON.parse(event.body);
    const { userId, projectId } = body;
    if (!userId || !projectId) {
        log("WARNING", 'Invalid body @mapCreate-background', JSON.stringify(body));
        return;
    }

    // Fetch the map
    let map = await mapRead(projectId);
    if (!map) {
      log("ERROR", 'Project not found @mapCreate-background', projectId);
      return;
    }
    if (map.creationStatus !== 'requested') {
      log("WARNING", 'Map already processing @mapCreate-background:', map.creationStatus);
      return;
    }

    // Initialize
    let jsonResponse = null;

    try {
        // Update to 'creating'
        map.creationStatus = 'Creating';
        await mapUpdate(map);

        // Set stages
        const stages = ["1-seed", "2-grow", "3-enrich"];
        const transformer = "9-transformer";

        // Set user message from stored prompt
        let instructions, messages, conversation, response, parsedResponse, stageMap = null;
        let userMessage = map.userPrompt;

        // Construct nodes via AI loop
        for (let i = 0; i < stages.length; i++) {
            // Get instructions
            instructions = await getInstructionsTxt(stages[i]);

            // Set messages
            messages = [
                { speaker: "assistant", message: "i'll follow the instructions strickly" },
                { speaker: "user", message: userMessage }
            ];

            // Construct conversation
            conversation = constructConversation(instructions, messages);

            // Ask AI
            log("DEBUG", `Asking AI @mapCreate-background: ${stages[i]}`);
            response = await askAIBridge(conversation);
            console.log(response);

            // Parse response
            parsedResponse = parseJSON(response);
            // If parsing successfull, skip transformer
            if (parsedResponse) {
                log("DEBUG", `Skipping transformer @mapCreate-background: ${stages[i]}`);
            // Or run transformer
            } else {
                // Get transformer instructions
                instructions = await getInstructionsTxt(transformer);
                // Set messages
                messages = [
                    { speaker: "assistant", message: "i'll follow the instructions strickly" },
                    { speaker: "user", message: response }
                ];
                // Construct conversation
                conversation = constructConversation(instructions, messages);
                // Ask AI
                log("DEBUG", `Asking AI transformer @mapCreate-background: ${stages[i]}`);
                response = await askAIBridge(conversation);
                // Parse response
                parsedResponse = parseJSON(response);
                if (!parsedResponse) {
                    log("WARNING", `Transformer failed @mapCreate-background: ${stages[i]}`);
                    break;
                }
            }

            // Construct map
            map.title = parsedResponse.title || map.title;
            map.owner = userId;
            map.lastUpdated = new Date(Date.now());
            // Seed stage
            if (stages[i] === "1-seed") {
                // Status
                map.creationStatus = 'Brainstorming';
                // Nodes
                map.nodes = parsedResponse.nodes;
                // Links
                for (let n = 0; n < map.nodes.length; n++) {
                    if (n > 0) map.nodes[n].directLink = [map.nodes[0].nodeId];
                    map.nodes[n].relatedLink = [];
                }
                // Update map
                await mapUpdate(map);
                // Assign map to user
                const user = await userAssignMap({ assignedUserId: userId, map });

            // Grow stage
            } else if (stages[i] === "2-grow") {
                // Add nodes
                map.nodes = [...parsedResponse.nodes, ...map.nodes];
                // Status
                map.creationStatus = 'Enriching';
                // Update map
                await mapUpdate(map);

            // Enrich stage
            } else if (stages[i] === "3-enrich") {
                // Overlay nodes
                map.nodes = parsedResponse.nodes;
            }

            // Construct next stage map
            if (i < stages.length - 1) {
                stageMap = {
                    userPrompt: map.userPrompt,
                    title: map.title,
                    nodes: map.nodes.map(node => ({ 
                        nodeId: node.nodeId,
                        topic: node.topic,
                        content: node.content,
                        directLink: node.directLink,
                        relatedLink: node.relatedLink }))
                };
                userMessage = JSON.stringify(stageMap);
            }
        }

        // Final map
        map.creationStatus = 'Created';
        map.nodes = map.nodes ? map.nodes : [];
        for (let i = 0; i < map.nodes.length; i++) {
            map.nodes[i].detail = map.nodes[i].detail ? map.nodes[i].detail : "";
            map.nodes[i].directLink = map.nodes[i].directLink ? map.nodes[i].directLink : [];
            map.nodes[i].relatedLink = map.nodes[i].relatedLink ? map.nodes[i].relatedLink : [];
            map.nodes[i].x = null;
            map.nodes[i].y = null;
            map.nodes[i].locked = false;
            map.nodes[i].approved = false;
            map.nodes[i].maximized = false;
            map.nodes[i].hidden = false;
            map.nodes[i].colorSchemeName = null;
        }

        // Sanitize map links
        map = sanitizeMapLinks(map);

        // Update map
        await mapUpdate(map);

        return;

    } catch (error) {
        log("ERROR", `Error in background map creation for ${projectId}: ${error.message}`);
        // Update to 'failed' on error
        map.creationStatus = 'Failed';
        await mapUpdate(map);
    }
};