// FUNCTION TO ASSIGN MAP TO USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const userRead = require('./userRead.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - { assignedUserId, map }
    RETURN {map} - map || false
*/

async function userAssignMap({ assignedUserId, map }) {

    // Validate inputs
    if (!assignedUserId || typeof assignedUserId !== 'string' ||
        !map || typeof map !== 'object' ||
        !map.projectId || typeof map.projectId !== 'string' ||
        !map.title || typeof map.title !== 'string' ||
        !map.lastUpdated || !(map.lastUpdated instanceof Date)) {
            log("ERROR", "Invalid input @userAssignMap", { assignedUserId, map });
            return false;
    }

    const mapMeta = { projectId: map.projectId, title: map.title, lastUpdated: map.lastUpdated };

    // Add new map to user
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { userId: assignedUserId },
                                     update: { $push: { maps: mapMeta} }
    });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Failed to assign map to user @userAssignMap", assignedUserId);
        return false;
    }

    // Read user after update
    const user = await userRead(assignedUserId);
    // Handle error
    if (!user) {
        log("ERROR", "Failed to read user after assigning map", assignedUserId);
        return false;
    }

    // Return user
    return user;
}

module.exports = userAssignMap;