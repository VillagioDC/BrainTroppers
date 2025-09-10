// CANVAS MODULES
// USER ACCOUNT MODULE

// Import modules
import { removeUserMenu } from '../interface/userMenu.js';
import { getLocalStorageUser } from '../../common/userLocalStorage.js';
import { showNotification } from '../../common/notifications.js';

export async function userAccount() {
    // Remove user menu
    removeUserMenu();
    // Load user account popup
    await loadUserAccountPopup();
    // Fill user account info
    fillUserAccountInfo();
    // Bind event listeners
    bindUserAccountPopupEvents();
}

async function loadUserAccountPopup() {
    try {
        const response = await fetch('./snippets/user-account.html');
        if (!response.ok) throw new Error('Failed to load user account.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    // Catch errors
    } catch (error) {
        console.error('Error loading user account popup:', error);
    }
}

function fillUserAccountInfo() {
    // Get user
    const user = getLocalStorageUser();
    // Set user icon
    const userIcon = document.getElementById("user-icon");
    if (user && user.icon && typeof user.icon === 'string') {
        userIcon.innerHTML = user.icon
    } else {
        userIcon.innerHTML = '<i class="fas fa-user-alt"></i>';
    }
    // Set user name
    const userName = document.getElementById("user-name");
    if (user && user.name && typeof user.name === 'string' && user.name)
        userName.innerHTML = user.name+'&nbsp;<i id="edit-name" class="fas fa-pencil-alt button"></i>';
    // Set user email
    const userEmail = document.getElementById("user-email");
    if (user && user.email && typeof user.email === 'string' && user.email)
        userEmail.textContent = user.email;
}

// Bind event listeners to user account popup
function bindUserAccountPopupEvents() {
    // Add event listeners to user account popup
    if (document.getElementById("close-user-account-popup"))
        document.getElementById("close-user-account-popup").addEventListener("click", removeUserAccountPopup);
    if (document.getElementById("user-account-icon"))
        document.getElementById("user-account-icon").addEventListener("click", editIcon);
    if (document.getElementById("edit-name"))
        document.getElementById("edit-name").addEventListener("click", editName);
    if (document.getElementById("change-password"))
        document.getElementById("change-password").addEventListener("click", changePassword);
    if (document.getElementById("delete-account"))
        document.getElementById("delete-account").addEventListener("click", showDeleteAccountConfirm);
    document.addEventListener('click', outsideClickHandler);
    document.addEventListener('keydown', escapeKeyHandler);
}

// Edit icon
function editIcon() {
    // Show notification
    showNotification('Coming soon', 'info');
    // Remove user account popup
    removeUserAccountPopup();
}

// Edit name
function editName() {
    // Show notification
    showNotification('Coming soon', 'info');
    // Remove user account popup
    removeUserAccountPopup();
}

// Change password
function changePassword() {
    // Show notification
    showNotification('Coming soon', 'info');
    // Remove user account popup
    removeUserAccountPopup();
}

// Show delete account confirm
function showDeleteAccountConfirm() {
    // Flag delete account icon
    if (document.getElementById("delete-account")) {
        document.getElementById("delete-account").classList.add("disabled");
    }
    // Show delete account confirm icon
    if (document.getElementById("delete-account-confirm")) {
        document.getElementById("delete-account-confirm").classList.remove("disabled");
    }
    // Add event listener
    if (document.getElementById("delete-account-confirm"))
        document.getElementById("delete-account-confirm").addEventListener("click", deleteAccount);
}

// Delete account
function deleteAccount(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Show notification
    showNotification('Coming soon', 'info');
    // Remove user account popup
    removeUserAccountPopup();
}

// Outside click
function outsideClickHandler(e) {
    const userAccountPopup = document.getElementById("user-account-popup");
    if (e.target === userAccountPopup ) removeUserAccountPopup();
}

// Escape key handler
function escapeKeyHandler(e) {
    if (e.key === "Escape") removeUserAccountPopup();
}

// Remove user account popup
function removeUserAccountPopup() {
    // Remove event listeners from user account popup
    if (document.getElementById("close-user-account-popup"))
        document.getElementById("close-user-account-popup").removeEventListener("click", removeUserAccountPopup);
    if (document.getElementById("user-account-icon"))
        document.getElementById("user-account-icon").removeEventListener("click", editIcon);
    if (document.getElementById("edit-name"))
        document.getElementById("edit-name").removeEventListener("click", editName);
    if (document.getElementById("change-password"))
        document.getElementById("change-password").removeEventListener("click", changePassword);
    if (document.getElementById("delete-account"))
        document.getElementById("delete-account").removeEventListener("click", showDeleteAccountConfirm);
    if (document.getElementById("confirm-delete-account"))
        document.getElementById("confirm-delete-account").removeEventListener("click", deleteAccount);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escapeKeyHandler);
    // Remove popup container
    if (document.getElementById("user-account-popup"))
        document.getElementById("user-account-popup").remove();
}
