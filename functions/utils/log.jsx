// FUNCTION TO LOG IN CONSOLE

/* PARAMETERS
    type {string} - log type
    message {string} - log message
    detail {string} - log detail
    RETURN - Nothing
*/

function log(type, message, detail) {

    // Colors
    const color = {
        "green": "\x1b[32m",
        "yellow": "\x1b[33m",
        "orange": "\x1b[33m",
        "red": "\x1b[31m",
        "purple": "\x1b[35m",
        "gray": "\x1b[90m",
        "reset": "\x1b[0m"
    }

    // Handle input error
    if (!type || !message) {
        const input = `type: ${typeof type}, message: ${typeof message}`; 
        console.log(`${color.red}SERVER ERROR${color.reset}: Invalid input @log ${color.gray}${input}${color.reset}`); //console.error("ERROR: Invalid input @log.", input);
        return;
    }
    
    
    // Log by type
    switch (type) {
        case "INFO":
            console.log(`${color.green}${type}${color.reset}: ${message}`);
            if (detail) console.log(`${color.gray}${detail}${color.reset}`);
            break;
        case "DEBUG":
            console.log(`${color.purple}${type}${color.reset}: ${message}`);
            if (detail) console.log(`${color.gray}${detail}${color.reset}`);
            break;
        case "WARNING":
            console.log(`${color.orange}${type}${color.reset}: ${message}`);
            if (detail) console.log(`${color.gray}${detail}${color.reset}`);
        case "ERROR":
            console.log(`${color.red}${type}${color.reset}: ${message}`);
            if (detail) console.log(`${color.gray}${detail}${color.reset}`);
            break;
        default:
            console.log(`${color.gray}${type}${color.reset}: ${message}`);
            if (detail) console.log(`${color.gray}${detail}${color.reset}`);
            break;
    }
    return;
}

module.exports = log;