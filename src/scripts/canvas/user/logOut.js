// CANVAS MODULES
// LOG OUT MODULE

// Import modules
import { removeLocalStorageMap } from '../utils/mapLocalStorage.js';
import { removeLocalStorageUser } from '../../common/userLocalStorage.js';
import { removeUserMenu } from '../interface/userMenu.js';
import { redirectToInitialPage } from '../../common/redirectToInitialPage.js';
import { showNotification } from '../../common/notifications.js';

export function logOut() {
    // Show notification
    showNotification('Logging out...', 'info', 'wait');
    // Remove local storage data
    removeLocalStorageMap();
    removeLocalStorageUser();
    // Remove user menu
    removeUserMenu();
    // Redirect to sign in page
    redirectToInitialPage();
}