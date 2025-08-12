// FUNCTION TO DECONSTRUCT MAP
// No dependencies

// Functions
// No functions

/* PARAMETERS
    map {object} - map
    RETURN {string} - map as json-like string
*/
function deconstructMap(map) {

    // Deconstruct map to output json-like string
    let result = `Title: ${map.title}\nNodes: [\n`;
    map.nodes.forEach((node) => {
        result += `{ NodeId: ${node.nodeId},`;
        result += ` content: ${node.content},`;
        result += ` detail: ${node.detail} }\n`;
    });
    result += "]\n";
    result = result.trim();

    // Return
    return result;

}

module.exports = deconstructMap;