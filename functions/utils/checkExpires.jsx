// FUNCTION TO CHECK EXPIRES
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const setSessionExpires = require('./setExpires.jsx');
const log = require('./log.jsx');

/* PARAMETERS
  input {datetime} - expires
  RETURN {bool} - true || false
*/

async function checkSessionExpired(userId) {

    // Check expires on database
    const user = await executeDB({ collectionName: 'users',
                                  type: 'findOne',
                                  filter: { userId: userId } });
    const expires = user.expires;
    // Check expires
    const now = new Date(Date.now());
    if (expires > now) {
        // Renew
        await setSessionExpires(userId);
        // Is valid
        return true;
    }
    // Has expired
    return false;

}

module.exports = checkSessionExpired;