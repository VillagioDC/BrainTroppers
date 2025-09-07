// FUNCTION TO ADD BLANK NODE ON MAP
// No dependencies

// Functions
const generateToken = require('../utils/generateToken.jsx');
const mapNodeAdd = require('./mapNodeAdd.jsx');
const mapNodeUpdate = require('./mapNodeUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERES
    input {object, string, object} - map, parentId, node
    RETURN {object} - updated map
*/

async function mapAddBlankNode(map, parentId, node) {

    // Check inputs
    if (!map || typeof map !== "object" ||
        !parentId || typeof parentId !== "string" ||
        !node || typeof node !== "object") {
        log("SERVER ERROR", "Invalid input @mapAddBlankNode.");
        return null;
    }

    // Set definite nodeId
    const nodeId = generateToken();
    node.nodeId = nodeId;

    // Push new node to map
    map.nodes.push(node);

    // Add new node
    await mapNodeAdd(map, node);

    // Update parent node
    const parentNode = map.nodes.find(n => n.nodeId === parentId);
    parentNode.directLink.push(node.nodeId);
    
    // Update map
    const updatedMap = await mapNodeUpdate(map, parentNode);

    // Return
    return updatedMap;
}

module.exports = mapAddBlankNode;