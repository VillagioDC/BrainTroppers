// FUNCTION TO UPLOAD EXPORT MAP
// No dependencies

// Functions
const createTempFolder = require('./createTempFolder.jsx');
const mapRead = require('../controller/mapRead.jsx');
const sanitizeMap = require('./sanitizeMap.jsx');
const createPdfMap = require('./createPdfMap.jsx');
const createPngMap = require('./createPngMap.jsx');
const createDocMap = require('./createDocMap.jsx');
const uploadExportMap = require('./uploadExportMap.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
  input {object, string} - map, type 
  RETURN {bool} - downloadUrl || null
*/

async function exportMap(projectId, type) {
    
    // Check input
    if (!projectId || typeof projectId !== 'string' || !type || typeof type !== 'string') {
        log("ERROR", 'Invalid request @exportMap');    
        return null;
    }

    try {
        // Create export temp folder
        await createTempFolder();

        // Read map
        const fullMap = await mapRead(projectId);
        if (!fullMap) {
            log("ERROR", 'Project not found @exportMap', projectId);
            return null;
        }

        // Check existing nodes on map
        if (!fullMap.nodes || fullMap.nodes.length === 0) {
            log("WARNING", 'Map has no nodes @exportMap', projectId);
            return null;
        }

        // Sanitize map
        const map = await sanitizeMap(fullMap);

        // Create source file of map
        let sourceFilepath = null;
        if (type === 'pdf') sourceFilepath = await createPdfMap(map);
        else if (type === 'png') sourceFilepath = await createPngMap(map);
        else if (type === 'docx') sourceFilepath = await createDocMap(map);
        else {
            log("ERROR", 'Invalid type @exportMap', type);
            return null;
        }

        // Upload file
        const downloadUrl = await uploadExportMap(projectId, sourceFilepath);
        if (!downloadUrl) {
            log("ERROR", 'Unable to export map @exportMap');
            return null;
        }

        // Return
        return downloadUrl;
    
    // Catch error
    } catch (error) {
        log("ERROR", 'Unable to export map @exportMap', error);
        return null;
    }
}

module.exports = exportMap;