// ES MODULE TO ASK AI
// CHECK DOCUMENTATION
import { ChatLLM7 } from "langchain-llm7"; // npm install langchain-llm7
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages"; // npm install @langchain/core

/* PARAMETERS
    constructedConversation {Object} - conversation as { system: string, user: string, assistant: string, ... }
    RETURN {string} || null - raw string response from AI
*/

async function askAI(constructedConversation) {

    // Handle input error
    if (!constructedConversation || typeof constructedConversation !== "object") {
        const input = `constructedConversation: ${typeof constructedConversation}`; 
        console.error("ERROR: Invalid input @askAI.", input);
        return null;
    }

    // Set temperature from 0.5 to 0.9
    const temperature = Math.random() * (0.9 - 0.5) + 0.5;

    // Initialize the model (defaults or provide specific options)
    const chat = new ChatLLM7({
        modelName: "gpt-4o-mini-2024-07-18",
        //modelName: "gpt-4.1-nano",
        temperature: temperature,
        maxTokens: 136192,
        timeout: 240,
        maxRetries: 3
    });

    // Construct message to LLM7 api
    const messages = constructedConversation.map(item => {
        const [type, content] = Object.entries(item)[0];
        switch (type) {
            case 'system':
                return new SystemMessage(content);
            case 'user':
                return new HumanMessage(content);
            case 'assistant':
                return new AIMessage(content);
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    });

    // Invoke LLM7
    try {
        // Ask AI
        const response = await chat.invoke(messages);

        // Return response
        return response;

    // Catch error
    } catch (error) {
        console.error("ERROR: Unable to ask LLM7 AI @askAI.", error);
        return null;
    }
}

export default askAI;