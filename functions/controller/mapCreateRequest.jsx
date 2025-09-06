// FUNCTION TO CREATE NEW MAP
// No dependencies

// Functions
const mapAddNew = require('./mapAddNew.jsx');
const setApiUrl = require('../utils/setApiUrl.jsx');
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string} - user query
    RETURN {object} - map request response
*/

async function mapCreateRequest({userId, query}) {

    // Generate  new map and add to database
    let newMap = await mapAddNew({userId, query});
    if (!newMap) {
        log('SERVER WARNING', 'Unable to create map');
        return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unable to create map' })
      };
    }

    // Kicks off background function
    try {
        const url = setApiUrl('mapCreate-background');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: newMap.projectId })
        });
        // Check imediate response
        if (response.status !== 202) {
            // Failed
            log('SERVER WARNING', `Failed to invoke background function: status ${response.status}`);
            newMap.creationStatus = 'failed';
            await mapUpdate(newMap);
        }
    // Catch error
    } catch (error) {
        log('SERVER WARNING', 'Unable to create map', error);
        newMap.creationStatus = 'failed';
        await mapUpdate(newMap);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to create map' })
        };
    }

    // Return
    return {
        statusCode: 202,
        body: JSON.stringify(newMap)
    };
}

module.exports = mapCreateRequest;