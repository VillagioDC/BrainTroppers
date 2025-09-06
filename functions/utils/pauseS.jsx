// FUNCTION TO PAUSE MILLISECONDS
// No dependencies

// Functions
const log = require("./log.jsx");

/* PARAMETERS
   seconds {number} - Number of seconds to pause
   RETURN nothing
*/

async function pauseS(seconds) {

    // Check input
    if (!seconds || typeof seconds !== "number") {
        log("SERVER WARNING", "Empty seconds @pauseS");
        seconds = Math.random() * 2 + 0;
    }

    // Pause
    await new Promise((resolve) => setTimeout(resolve, seconds));

    // Return
    return;
}

module.exports = pauseS;