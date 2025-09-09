// FUNCTION TO EXPAND NODE
// No dependencies

// Functions
const mapRead = require('./mapRead.jsx');
const setApiUrl = require('../utils/setApiUrl.jsx');
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string} - user query
    RETURN {object} - map request response
*/

async function mapNodeExpandRequest(projectId, parentId, query) {

    // Check parameters
    if (!projectId || !parentId || !query) {
        log("ERROR", 'Missing parameters @mapNodeExpandRequest');
        return;
    }

    // Kicks off background function
    try {
        // Fetch the map
        let map = await mapRead(projectId);
        if (!map) {
            log("WARNING", "Invalid map for background processing @mapNodeExpandRequest:", projectId);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unable to rewrite node' })
            };
        }
        if (map.creationStatus !== 'created' && map.creationStatus !== 'failed') {
            log("WARNING", "Map creation status already processing @mapNodeExpandRequest:", projectId);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Unable to rewrite node' })
            };
        }

        // Delete map id
        delete map._id;

        const url = setApiUrl('mapNodeExpand-background');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ map, parentId, query })
        });
        // Check imediate response
        if (response.status !== 202) {
            // Failed
            log("ERROR", `Failed to invoke background function: status ${response.status}`);
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
        log("WARNING", 'Unable to create map @mapNodeExpandRequest', error);
        if (map) {
            map.creationStatus = 'failed';
            await mapUpdate(map);
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to expand node' })
        };
    }
}

module.exports = mapNodeExpandRequest;