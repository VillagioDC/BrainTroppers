// CANVAS MODULES
// USER ACCOUNT MODULE

// Import modules
import { getLocalStorageUser } from '../../common/userLocalStorage.js';
import { removeUserMenu } from '../interface/userMenu.js';

export function userAccount() {
    // Implement user account functionality
    console.log("Go to User Account clicked");
    const user = getLocalStorageUser();
    console.log("User:", user);
    // Remove user menu
    removeUserMenu();
}