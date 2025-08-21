// FUNCTION TO SET EXPIRES
// No dependencies

// Functions
// No functions

/* PARAMETERS
  no input
  RETURN {datetime} - expires
*/

function setExpires() {

    // Set expires
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Return expires
    return expires;

}

module.exports = setExpires;