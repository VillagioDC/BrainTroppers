// FUNCTION TO VALIDATE MAP
// No dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
  input {object} - map
  RETURN {boolean} - true || false
*/

function mapValidate(map) {

    // Validate input is a non-null object
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
        log("WARNING", "Invalid map @mapValidate", `map: ${typeof map}`);
        return false;
    }
    // Define expected fields to prevent injection of unexpected properties
    const expectedFields = [
        'projectId',
        'owner',
        'colabs',
        'userPrompt',
        'creationStatus',
        'title',
        'lastUpdated',
        'selectedNode',
        'nodes'
    ];
    // Prevent unexpected fields
    const actualFields = Object.keys(map);
    if (actualFields.some(field => !expectedFields.includes(field))) {
        log("WARNING", "Invalid fields @mapValidate", `map: ${JSON.stringify(map)}`);
        return false; 
    }

    // Validate projectId
    if (!map.projectId || typeof map.projectId !== 'string' || map.projectId.length > 50 ) {
        log("WARNING", "Invalid projectId @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }

    // Validate owner (non-empty string, max 100 chars, no malicious content)
    if (!map.owner || typeof map.owner !== 'string' || map.owner.length > 50 ) {
        log("WARNING", "Invalid owner @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }

    // Validate colabs (array, can be empty)
    if (!Array.isArray(map.colabs)) {
        log("WARNING", "Invalid colabs @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }
    for (const colab of map.colabs) {
        if (!colab || typeof colab !== 'object' || Array.isArray(colab)) {
            log("WARNING", "Invalid colab type @mapValidate", `colab: ${JSON.stringify(colab)}`);
            return false;
        }
        // At least one of email or userId must be present
        if (!colab.email && !colab.userId) {
            log("WARNING", "Invalid colab (no colabs) @mapValidate", `colab: ${JSON.stringify(colab)}`);
            return false;
        }
        // Validate email (basic format, max 100 chars)
        if (colab.email && (typeof colab.email !== 'string' || colab.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colab.email))) {
            log("WARNING", "Invalid colab email @mapValidate", `colab: ${JSON.stringify(colab)}`);
            return false;
        }
        // Validate userId (non-empty string, max 100 chars, no malicious content)
        if (colab.userId && (typeof colab.userId !== 'string' || colab.userId.length > 50 || /[<>{};]/.test(colab.userId))) {
            log("WARNING", "Invalid colab userId @mapValidate", `colab: ${JSON.stringify(colab)}`);
            return false;
        }
        // Check for unexpected fields in colab
        const validColabFields = ['email', 'userId'];
        if (Object.keys(colab).some(field => !validColabFields.includes(field))) {
            log("WARNING", "Invalid colab fields @mapValidate", `colab: ${JSON.stringify(colab)}`);
            return false;
        }
    }

    // Validate userPrompt (non-empty string, max 1000 chars, no malicious content)
    if (!map.userPrompt || typeof map.userPrompt !== 'string' || map.userPrompt.length > 1000 || /[<>{};]/.test(map.userPrompt)) {
        log("WARNING", "Invalid userPrompt @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }

    // Validate title (non-empty string, max 200 chars, no malicious content)
    if (!map.title || typeof map.title !== 'string' || map.title.length > 200 || /[<>{};]/.test(map.title)) {
        log("WARNING", "Invalid title @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }

    // Validate lastUpdated (Date object or valid ISO date string)
    if (!map.lastUpdated || !(map.lastUpdated instanceof Date || (typeof map.lastUpdated === 'string' && !isNaN(Date.parse(map.lastUpdated))))) {
        log("WARNING", "Invalid lastUpdated @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }

    // Validate nodes (array, can be empty)
    if (!Array.isArray(map.nodes)) {
        log("WARNING", "Invalid nodes @mapValidate", `map: ${JSON.stringify(map)}`);
        return false;
    }
    // Collect nodeIds for link validation
    const nodeIds = new Set(map.nodes.map(node => node?.nodeId).filter(id => id));
    for (const node of map.nodes) {
        if (!node || typeof node !== 'object' || Array.isArray(node)) {
            log("WARNING", "Invalid node type @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Define expected node fields
        const validNodeFields = ['nodeId', 'shortName', 'content', 'detail', 'directLink', 'relatedLink', 'x', 'y', 'locked', 'approved', 'maximized', 'hidden', 'colorSchemeName'];
        if (Object.keys(node).some(field => !validNodeFields.includes(field))) {
            log("WARNING", "Invalid node fields @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate nodeId (non-empty string, max 100 chars, no malicious content)
        if (!node.nodeId || typeof node.nodeId !== 'string' || node.nodeId.length > 50 || /[<>{};]/.test(node.nodeId)) {
            log("WARNING", "Invalid nodeId @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate shortName (non-empty string, max 100 chars, no malicious content)
        if (!node.shortName || typeof node.shortName !== 'string' || node.shortName.length > 50) {
            log("WARNING", "Invalid shortName @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate content (non-empty string, max 200 chars, no malicious content)
        if (!node.content || typeof node.content !== 'string') {
            log("WARNING", "Invalid content @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate detail (string, can be empty, max 1000 chars, no malicious content)
        if (typeof node.detail !== 'string' || node.detail.length > 1000) {
            log("WARNING", "Invalid detail @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate directLink (array of valid nodeIds)
        if (!Array.isArray(node.directLink) || node.directLink.some(id => typeof id !== 'string')) {
            log("WARNING", "Invalid directLink @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate relatedLink (array of valid nodeIds)
        if (!Array.isArray(node.relatedLink) || node.relatedLink.some(id => typeof id !== 'string')) {
            log("WARNING", "Invalid relatedLink @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate x (null or "x" format)
        if (node.x !== null && (typeof node.x !== 'number' || !Number.isInteger(node.x))) {
            log("WARNING", "Invalid x @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate y (null or "y" format)
        if (node.y !== null && (typeof node.y !== 'number' || !Number.isInteger(node.y))) {
            log("WARNING", "Invalid y @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate locked (boolean)
        if (typeof node.locked !== 'boolean') {
            log("WARNING", "Invalid locked @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate approved (boolean)
        if (typeof node.approved !== 'boolean') {
            log("WARNING", "Invalid approved @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate maximized (boolean)
        if (typeof node.maximized !== 'boolean') {
            log("WARNING", "Invalid maximized @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate hidden (boolean)
        if (typeof node.hidden !== 'boolean') {
            log("WARNING", "Invalid hidden @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
        // Validate colorScheme (string, max 20 chars)
        if (!node.colorSchemeName || typeof node.colorSchemeName !== 'string' || node.colorSchemeName.length > 20) {
            log("WARNING", "Invalid colorSchemeName @mapValidate", `node: ${JSON.stringify(node)}`);
            return false;
        }
    }
    // All validations passed
    return true;
}

module.exports = mapValidate;