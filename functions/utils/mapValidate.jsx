// FUNCTION TO VALIDATE MAP
// No dependencies

/* PARAMETERS
  input {object} - map
  RETURN {boolean} - true || false
*/

function mapValidate(map) {
    // Validate input is a non-null object
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
        return false;
    }
    // Define expected fields to prevent injection of unexpected properties
    const expectedFields = [
        'projectId',
        'owner',
        'colabs',
        'userPrompt',
        'title',
        'lastUpdated',
        'nodes'
    ];
    
    const actualFields = Object.keys(map);
    if (actualFields.some(field => !expectedFields.includes(field))) {
        return false; // Unexpected fields detected
    }

    // Validate projectId (MongoDB ObjectId: 24-character hexadecimal)
    if (!map.projectId || typeof map.projectId !== 'string' || map.projectId.length !== 50 ) {
        return false;
    }

    // Validate owner (non-empty string, max 100 chars, no malicious content)
    if (!map.owner || typeof map.owner !== 'string' || map.owner.length > 50 || /[<>{};]/.test(map.owner)) {
        return false;
    }

    // Validate colabs (array, can be empty)
    if (!Array.isArray(map.colabs)) {
        return false;
    }
    for (const colab of map.colabs) {
        if (!colab || typeof colab !== 'object' || Array.isArray(colab)) {
            return false;
        }
        // At least one of email or userId must be present
        if (!colab.email && !colab.userId) {
            return false;
        }
        // Validate email (basic format, max 100 chars)
        if (colab.email && (typeof colab.email !== 'string' || colab.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colab.email))) {
            return false;
        }
        // Validate userId (non-empty string, max 100 chars, no malicious content)
        if (colab.userId && (typeof colab.userId !== 'string' || colab.userId.length > 100 || /[<>{};]/.test(colab.userId))) {
            return false;
        }
        // Check for unexpected fields in colab
        const validColabFields = ['email', 'userId'];
        if (Object.keys(colab).some(field => !validColabFields.includes(field))) {
            return false;
        }
    }

    // Validate userPrompt (non-empty string, max 1000 chars, no malicious content)
    if (!map.userPrompt || typeof map.userPrompt !== 'string' || map.userPrompt.length > 1000 || /[<>{};]/.test(map.userPrompt)) {
        return false;
    }

    // Validate title (non-empty string, max 200 chars, no malicious content)
    if (!map.title || typeof map.title !== 'string' || map.title.length > 200 || /[<>{};]/.test(map.title)) {
        return false;
    }

    // Validate lastUpdated (Date object or valid ISO date string)
    if (!map.lastUpdated || !(map.lastUpdated instanceof Date || (typeof map.lastUpdated === 'string' && !isNaN(Date.parse(map.lastUpdated))))) {
        return false;
    }

    // Validate nodes (array, can be empty)
    if (!Array.isArray(map.nodes)) {
        return false;
    }
    // Collect nodeIds for link validation
    const nodeIds = new Set(map.nodes.map(node => node?.nodeId).filter(id => id));
    for (const node of map.nodes) {
        if (!node || typeof node !== 'object' || Array.isArray(node)) {
            return false;
        }
        // Define expected node fields
        const validNodeFields = ['nodeId', 'shortName', 'content', 'detail', 'directLink', 'relatedLink', 'xy', 'hidden', 'colorScheme', 'layer'];
        if (Object.keys(node).some(field => !validNodeFields.includes(field))) {
            return false;
        }
        // Validate nodeId (non-empty string, max 100 chars, no malicious content)
        if (!node.nodeId || typeof node.nodeId !== 'string' || node.nodeId.length > 100 || /[<>{};]/.test(node.nodeId)) {
            return false;
        }
        // Validate shortName (non-empty string, max 100 chars, no malicious content)
        if (!node.shortName || typeof node.shortName !== 'string' || node.shortName.length > 100 || /[<>{};]/.test(node.shortName)) {
            return false;
        }
        // Validate content (non-empty string, max 200 chars, no malicious content)
        if (!node.content || typeof node.content !== 'string') {
            return false;
        }
        // Validate detail (string, can be empty, max 1000 chars, no malicious content)
        if (typeof node.detail !== 'string') {
            return false;
        }
        // Validate directLink (array of valid nodeIds)
        if (!Array.isArray(node.directLink) || node.directLink.some(id => typeof id !== 'string')) {
            return false;
        }
        // Validate relatedLink (array of valid nodeIds)
        if (!Array.isArray(node.relatedLink) || node.relatedLink.some(id => typeof id !== 'string')) {
            return false;
        }
        // Validate xy (null or "x,y" format with numbers)
        if (node.xy !== null && (typeof node.xy !== 'string' || !/^-?\d+,-?\d+$/.test(node.xy))) {
            return false;
        }
        // Validate hidden (boolean)
        if (typeof node.hidden !== 'boolean') {
            return false;
        }
        // Validate colorScheme (string, max 20 chars)
        if (!node.colorScheme || typeof node.colorScheme !== 'string' || node.colorScheme.length > 20 || !/^#?[A-Za-z0-9]+$/.test(node.colorScheme)) {
            return false;
        }
        // Validate layer (non-negative integer)
        if (typeof node.layer !== 'number' || !Number.isInteger(node.layer) || node.layer < 0) {
            return false;
        }
    }
    // All validations passed
    return true;
}

module.exports = mapValidate;