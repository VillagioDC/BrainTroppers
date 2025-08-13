// FUNCTION TO BRIDGE TO ASK AI
// No dependencies

// Functions
const removeUnwantedLines = require("./removeUnwantedLines.jsx");
const log = require("../utils/log.jsx");

/* PARAMETERS
    constructedConversation {Object} - conversation as { system: string, user: string, assistant: string, ... }
    RETURN {string} || null - raw string response from AI
*/

async function askAIBridge(constructedConversation) {

    // Handle input error
    if (!constructedConversation || typeof constructedConversation !== "object") {
        const input = `constructedConversation: ${typeof constructedConversation}`;
        log("SERVER ERROR", "Invalid input @askAIBridge.", input);
        return null;
    }

    try {
        // Dynamically import the ES module
        const askAI = (await import('./askAI.mjs')).default;
  
        // Call the function
        const response = await askAI(constructedConversation);

        // Check AI response
        if (!response || !response.content) {
            log("SERVER ERROR", "Unable to provide complete response @askAIBridge", response);
            return null;
        };

        // Remove unwanted lines
        const content = removeUnwantedLines(response.content);
        
        // Return response (content only)
        return content;

    } catch (error) {
        log("SERVER ERROR", "Unable to provide response from AI @askAIBridge", error);
        return null;
    }
}

module.exports = askAIBridge;