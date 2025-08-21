// FUNCTION TO CHECK EXPIRES
// No dependencies

// Functions
// No functions

/* PARAMETERS
  input {datetime} - expires
  RETURN {bool} - true || false
*/

function checkExpires(expires) {

    // Set expires
    const now = new Date(Date.now());

    // Check expires
    if (expires < now) {
        // Valid
        return true;
    }

    // Expired
    return false;

}

module.exports = setExpires;