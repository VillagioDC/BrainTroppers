// FUNCTION TO CONSTRUCT CONVERSATION
// No dependencies

// Functions
const log = require('../utils/log.jsx');

/* PARAMETERS
    instructions {string} - instructions for the conversation
    messages [array] - array of messages to be added to the conversation
    RETURN [array] || null - conversation as [] system: string, user: string, assistant: string, ... ]
*/

function constructConversation(instructions, messages) {

    // Handle input error
    if (!instructions || !messages) {
        const input = `instruction ${typeof instructions}, messages: ${typeof messages}`;
        log("SERVER ERROR", "Invalid input @constructConversation.", input);
        return null;
    };

    // Construct conversation
    let constructedConversation = [];

    // Add instructions
    constructedConversation.push({ system: instructions });

    // Define starting speaker
    let speaker = "user";
    if (messages.length % 2 === 0) speaker = "assistant";
    for (let i=0; i<messages.length; i++) {
        // Push message
        constructedConversation.push( { [speaker]: messages[i].message } );
        // Toggle speaker
        if (speaker === "user") speaker = "assistant";
        else speaker = "user";
    }

    // Return conversation
    return constructedConversation;

}

module.exports = constructConversation;