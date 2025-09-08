// FUNCTION TO ADD NEW NODE
// No dependencies

// Functions
const mapRead = require('./mapRead.jsx');
const setApiUrl = require('../utils/setApiUrl.jsx');
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');
const sanitizeMap = require('../utils/sanitizeMap.jsx');

/* PARAMETERS
    input {string, string, string} - projectId, parentId, user query
    RETURN {object} - map request response
*/

async function mapNodeAddRequest(projectId, parentId, query) {

    // Check parameters
    if (!projectId || !parentId || !query) {
        log('SERVER ERROR', 'Missing parameters @mapNodeAddRequest');
        return;
    }

    // Kicks off background function
    try {
        // Fetch the map
        let map = await mapRead(projectId);
        if (!map) {
            log('SERVER WARNING', "Invalid map for background processing @mapNodeAddRequest:", projectId);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unable to rewrite node' })
            };
        }
        if (map.creationStatus !== 'created' && map.creationStatus !== 'failed') {
            log('SERVER WARNING', "Map creation status already processing @mapNodeAddRequest:", projectId);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Unable to rewrite node' })
            };
        }

        // Delete map id
        delete map._id;

        const url = setApiUrl('mapNodeAdd-background');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ map, parentId, query })
        });
        // Check imediate response
        if (response.status !== 202) {
            // Failed
            log('SERVER ERROR', `Failed to invoke background function: status ${response.status}`);
            map.creationStatus = 'failed';
        } else {
            map.creationStatus = 'creating';
        }

        // Update map
        const updatedMap = await mapUpdate(map);

        // Return
        return {
            statusCode: 202,
            body: JSON.stringify(updatedMap)
        };

        // Catch error
    } catch (error) {
        log('SERVER WARNING', 'Unable to create map @mapNodeAddRequest', error);
        if (map) {
            map.creationStatus = 'failed';
            await mapUpdate(map);
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to add node' })
        };
    }
}

module.exports = mapNodeAddRequest;