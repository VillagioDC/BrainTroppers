// CANVAS MODULES
// CHECK SESSION EXPIRED MODULE

// Import modules
import { showNotification } from '../../common/notifications.js';
import { redirectToSignIn } from '../../common/redirectToInitialPage.js';

export function checkSessionExpired(responseData) {
    // Check response for session expired
    if (responseData && responseData.expired) {
        showNotification('Session expired.', 'error');
        setTimeout(() => {
            redirectToSignIn();
        }, 2000);
    }
}