// FUNCTION TO CHECK EXPIRES
// No dependencies

// Functions
const setSessionExpires = require('./setExpires.jsx');
const log = require('./log.jsx');

/* PARAMETERS
  input {datetime} - expires
  RETURN {bool} - true || false
*/

async function checkSessionExpired(userId, expires) {

    // Check expires
    const now = new Date(Date.now());
    if (expires < now) {
        // Renew
        await setSessionExpires(userId);
        // Valid
        return true;
    }

    // Expired
    return false;

}

module.exports = checkSessionExpired;