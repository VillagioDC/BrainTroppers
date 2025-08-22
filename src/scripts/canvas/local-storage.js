// CANVAS
// LOCAL STORAGE SCRIPT

// Read local storage user
function getLocalStorageUser() {
    if (!localStorage.getItem('user')) return;
    return JSON.parse(localStorage.getItem('user'));
}

// Get local storage userId
function getLocalStorageCredentials() {
    const user = getLocalStorageUser();
    if (!user || !user.id || !user.sessionToken) return;
    return {
        userId: user.id,
        sessionToken: user.sessionToken
    };
}

// Set local storage user
function setLocalStorageUser(user) {
    // Validate user object
    if (!user || typeof user !== 'object') {
        console.error('Invalid user object for local storage');
        return;
    }
    // Store user object in local storage
    localStorage.setItem('user', JSON.stringify(user));
}

// Read local storage map
function getLocalStorageMap() {
    if (!localStorage.getItem('map')) return;
    return JSON.parse(localStorage.getItem('map'));
}

// Set local storage map
function setLocalStorageMap(map) {
    // Validate map object
    if (!map || typeof map !== 'object') {
        console.error('Invalid map object for local storage');
        return;
    }
    // Store map object in local storage
    localStorage.setItem('map', JSON.stringify(map));
}

// Remove local storage map
function removeLocalStorageMap() {
    localStorage.removeItem('map');
}

// Remove local storage data
function removeLocalStorageData() {
    localStorage.removeItem('user');
    localStorage.removeItem('map');
}