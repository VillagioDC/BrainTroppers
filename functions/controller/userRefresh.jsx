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
        log("SERVER ERROR", "Unable to refresh user data @userRefresh.");
        return false;
    }
    // Load user data
    const user = await executeDB({ collectionName: 'users',
                                 type: 'findOne',
                                 filter: { 'userId': userId } });
    // Handle error
    if (!user) {
        log("SERVER ERROR", "Unable to find user @userRefresh.");
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
    const userMaps = Array.isArray(user.maps) ? user.maps : [];
    const ownedMaps = Array.isArray(owned) ? owned : [];
    const colabMaps = Array.isArray(colab) ? colab : [];

    // Construct user map list without duplicates
    const mapList = Array.from(
        new Map([...userMaps, ...ownedMaps, ...colabMaps]
            .map(map => [map.projectId, map])
        ).values()
    );
    // Refresh user data
    user.maps = mapList; 

    // Return
    return user;
}

module.exports = userRefresh;