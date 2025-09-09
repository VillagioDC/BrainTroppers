// FUNCTION TO REFRESH USER DATA
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - { userId }
    RETURN {map} - user || false
*/

async function userRefresh( userId ) {

    // Check new map
    if (!userId || typeof userId !== 'string') {
        log("ERROR", "Unable to refresh user data @userRefresh.");
        return false;
    }
    // Load user data
    const user = await executeDB({ collectionName: 'users',
                                 type: 'findOne',
                                 filter: { 'userId': userId } });
    // Handle error
    if (!user) {
        log("ERROR", "Unable to find user @userRefresh.");
        return false;
    }

    // Check all maps asigned to user    
    const owned = await executeDB({ collectionName: 'maps',
                                    type: 'findMany',
                                    filter: { 'owner': userId } });
    // Check all maps that user colabs
    const colab = await executeDB({ collectionName: 'maps',
                                    type: 'findMany',
                                    filter: { colabs: { $in: [userId] } } 
    });

    // Prevent null
    const ownedMaps = Array.isArray(owned) ? owned : [];
    const colabMaps = Array.isArray(colab) ? colab : [];

    // Construct user map list without duplicates
    const mapList = Array.from(
    new Map([...ownedMaps, ...colabMaps]
        .map(map => [map.projectId, map])
    ).values()
    ).map(({ projectId, title, lastUpdated }) => ({ projectId, title, lastUpdated }));

    // Refresh user data
    user.maps = mapList; 

    // Update user map list 
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { 'userId': userId },
                                     update: { $set: { 'maps': mapList } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to refresh user data @userRefresh.");
        return false;
    }
    // Return
    return user;
}

module.exports = userRefresh;