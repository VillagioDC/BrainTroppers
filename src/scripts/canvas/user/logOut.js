// CANVAS MODULES
// LOG OUT MODULE

// Import modules
import { removeLocalStorageMap } from '../utils/mapLocalStorage.js';
import { removeLocalStorageUser } from '../../common/userLocalStorage.js';
import { removeUserMenu } from '../interface/userMenu.js';
import { redirectToInitialPage } from '../../common/redirectToInitialPage.js';

export function logOut() {
    // Remove local storage data
    removeLocalStorageMap();
    removeLocalStorageUser();
    // Remove user menu
    removeUserMenu();
    // Redirect to sign in page
    redirectToInitialPage();
}