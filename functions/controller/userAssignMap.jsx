// FUNCTION TO ASSIGN MAP TO USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
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
        log("SERVER_ERROR", "Invalid input for assigning map to user", { assignedUserId, map });
        return false;
    }

    // Add new map to user
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { userId: assignedUserId },
                                     update: { $push: { maps: { projectId: map.projectId,
                                                                title: map.title,
                                                                lastUpdated: map.lastUpdated }} }
    });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER_ERROR", `Failed to assign map to user ${assignedUserId}`);
        return false;
    }

    // Read user after update
    const user = await executeDB({ collectionName: 'users',
                                   type: 'findOne',
                                   filter: { userId: assignedUserId }
    });
    // Handle error
    if (!user) {
        log("SERVER_ERROR", `Failed to read user ${assignedUserId} after assigning map`);
        return false;
    }

    // Return
    return user;
}

module.exports = userAssignMap;