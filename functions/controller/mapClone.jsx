// FUNCTION TO CLONE MAP
// No dependencies

// Functions
const mapRead = require('./mapRead.jsx');
const executeDB = require('../mongoDB/executeDB.jsx');
const generateToken = require('../utils/generateToken.jsx');
const userRead = require('./userRead.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - projectID
    RETURN {object} - updatedUser || null
*/

async function mapClone({ userId, projectId }) {

    // Check required fields
    if (!userId || !projectId) {
        log("ERROR", 'Invalid input @mapClone');
        return null;
    }

    // Read map
    const sourceMap = await mapRead(projectId);
    if (!sourceMap) {
        log("ERROR", "Unable to read map @cloneMap", projectId);
        return null;
    }

    // Clone map
    let map = { ...sourceMap };
    // Transform
    delete map._id;
    map.projectId = generateToken();
    map.title = '(clone) ' + map.title;
    map.creationStatus = 'requested';
    map.lastUpdated = new Date(Date.now());

    // Insert cloned map on database
    const insertResult = await executeDB({ collectionName: 'maps',
                                           type: 'insertOne',
                                           document: map });

    // Handle error
    if (!insertResult || insertResult.insertedCount === 0) {
        log("ERROR", "Unable to clone map @cloneMap", projectId);
        return null;
    }

    // Assign map to colabs
    const assignedMap = { projectId: map.projectId, title: map.title, lastUpdated: map.lastUpdated };
    // Assign to userId only (pending users will be refreshed on login)
    const colabUserIds = map.colabs ? map.colabs.map(c => c.userId).filter(userId => userId) : [];
    if (colabUserIds.length > 0) {
        const updatedColabs = await executeDB({ collectionName: 'users',
                                                type: 'updateMany',
                                                filter: { userId: { $in: colabUserIds } },
                                                update: { $push: { maps: assignedMap } } });
        // Handle error
        if (!updatedColabs || updatedColabs.modifiedCount === 0) {
            log("ERROR", "Unable to assign map to colabs @cloneMap", projectId);
        }
    }

    // Assign map to owner
    const updatedOwner = await executeDB({ collectionName: 'users',
                                           type: 'updateOne',
                                           filter: { userId: map.owner },
                                           update: { $push: { maps: assignedMap } } });
    // Handle error
    if (!updatedOwner || updatedOwner.modifiedCount === 0) {
        log("ERROR", "Unable to assign map to user @cloneMap", projectId);
    }

    // Read user after update
    const updatedUser = await userRead(userId);
    // Handle error
    if (!updatedUser) {
        log("ERROR", "Unable to find user @cloneMap", userId);
        return null;
    }

    // Return {user, map}
    return {user: updatedUser, map};

}

module.exports = mapClone;