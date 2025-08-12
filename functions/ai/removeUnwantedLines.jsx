// FUNCTION TO REMOVE UNWANTED CONTENT FROM AI RESPONSE
// No dependencies

// Functions
// No functions

/* PARAMETERS
    content {string} - String to remove content from
    RETURN {string} - String without unwanted lines
*/

function removeUnwantedLines(rawContent) {

    // Handle input error
    if (!rawContent || typeof rawContent !== "string") {
        log("SERVER ERROR", "Invalid input @removeUnwantedLines.");
        return null;
    }

    // Unwanted content
    const unwantedContent = [
        `---`,
        `Register domains and get reliable web hosting with Namecheap's affordable services.`,
        `[Learn more](https://api.llm7.io/redirect/511355)`,
        `Discover how quantum computing and AI could reshape our future—empower innovation `,
        `or invite risks—stay informed with cutting-edge insights at [Learn more]`,
        `(https://api.llm7.io/redirect/claude)`
    ];

    // Remove all unwanted substrings
    let content = rawContent;
    unwantedContent.forEach(str => {
        content = content.split(str).join('').trim();
    });

    // Return
    return content;
}

module.exports = removeUnwantedLines;