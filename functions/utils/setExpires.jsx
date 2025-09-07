// FUNCTION TO SET EXPIRES
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');

/* PARAMETERS
  input {string} - userId
  RETURN {datetime} - expires
*/

async function setSessionExpires(userId) {

    // Set expires
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update database
    await executeDB({ collectionName: 'users',
                      type: 'updateOne',
                      filter: { userId: userId },
                      update: { $set: { expires: newExpires } } });

    // Return expires
    return newExpires;

}

module.exports = setSessionExpires;