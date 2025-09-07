// CANVAS MODULES
// PAUSE SECONDS MODULE

// Import modules
// No modules

export async function pauseS(seconds) {

    // Check input
    if (!seconds || typeof seconds !== "number") {
        console.warn("Empty seconds");
        seconds = Math.random() * 2 + 0;
    }

    // Pause
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

    // Return
    return;
}