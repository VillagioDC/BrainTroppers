// CANVAS MODULES
// CHECK SESSION EXPIRED MODULE

// Import modules
import { showNotification } from '../../common/notifications.js';
import { redirectToSignIn } from '../../common/redirectToInitialPage.js';

export async function checkSessionExpired(response) {
    // Check response for session expired
    if (response && response.status === 401 && response.expired) {
        showNotification('Session expired.', 'error');
        setTimeout(() => {
            redirectToSignIn();
        }, 2000);
    }
}