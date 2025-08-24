// USER LOCAL STORAGE MODULE

// Read local storage user
export function getLocalStorageUser() {
    if (!localStorage.getItem('braintroop-user')) return;
    return JSON.parse(localStorage.getItem('braintroop-user'));
}

// Get local storage userId
export function getLocalStorageCredentials() {
    const user = getLocalStorageUser();
    if (!user || !user.userId || !user.sessionToken) return;
    return {
        userId: user.userId,
        sessionToken: user.sessionToken
    };
}

// Set local storage user
export function setLocalStorageUser(user) {
    // Validate user object
    if (!user || typeof user !== 'object') {
        console.error('Invalid user object for local storage');
        return;
    }
    // Store user object in local storage
    localStorage.setItem('braintroop-user', JSON.stringify(user));
}