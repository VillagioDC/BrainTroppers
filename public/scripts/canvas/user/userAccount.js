// CANVAS MODULES
// USER ACCOUNT MODULE

// Import modules
import { removeUserMenu } from '../interface/userMenu.js';
import { getLocalStorageUser, setLocalStorageUser } from '../../common/userLocalStorage.js';
import { updateUserApi } from '../apis/updateUserApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function userAccount() {
    // Remove user menu
    removeUserMenu();
    // Load user account popup
    await loadUserAccountPopup();
    // Fill user account info
    fillUserAccountInfo();
    // Bind event listeners
    bindUserAccountPopupEvents();
    // Show user account popup
    if (document.getElementById("user-account-popup"))
        document.getElementById("user-account-popup").style.display = "flex";
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
    if (!document.getElementById("user-account-popup")) return;
    // Get user
    const user = getLocalStorageUser();
    // Replace user icon
    const userIcon = document.getElementById("user-account-icon");
    if (user && user.icon && typeof user.icon === 'string') {
        userIcon.innerHTML = `<span>${user.icon}</span>`;
    }
    // Set user name
    const userName = document.getElementById("user-account-name");
    if (user && user.name && typeof user.name === 'string' && user.name)
        userName.innerHTML = `${user.name}&nbsp;<i id="user-account-edit-name" class="fas fa-pencil-alt button"></i>`;
    // Set user email
    const userEmail = document.getElementById("user-account-email");
    if (user && user.email && typeof user.email === 'string' && user.email)
        userEmail.textContent = user.email;
}

// Bind event listeners to user account popup
function bindUserAccountPopupEvents() {
    // Close user account popup
    if (document.getElementById("close-user-account-popup"))
        document.getElementById("close-user-account-popup").addEventListener("click", removeUserAccountPopup);
    // User account icon
    if (document.getElementById("user-account-icon"))
        document.getElementById("user-account-icon").addEventListener("click", editUserIcon);
    // User account name
    if (document.getElementById("user-account-name"))
        document.getElementById("user-account-name").addEventListener("click", editUserName);
    // User account password
    if (document.getElementById("user-change-password"))
        document.getElementById("user-change-password").addEventListener("click", changeUserPassword);
    // User account delete
    if (document.getElementById("delete-account"))
        document.getElementById("delete-account").addEventListener("click", showDeleteAccountConfirm);
    // Outside click
    document.addEventListener('click', outsideClickHandler);
    // Escape key
    document.addEventListener('keydown', escapeKeyHandler);
}

// Edit icon
function editUserIcon(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Remove user icon label
    if (document.getElementById("user-account-icon"))
        document.getElementById("user-account-icon").style.display = "none";
    // Construct and focus on user icon input
    if (document.getElementById("user-account-icon-input-div")) {
        // Set input value
        document.getElementById("user-account-icon-input").value = document.getElementById("user-account-icon").textContent.trim().slice(0, 2);
        // Show user icon input
        document.getElementById("user-account-icon-input-div").style.display = "flex";
        // Focus
        document.getElementById("user-account-icon-input").focus();
        // Add event listener
        document.getElementById("user-account-icon-input").addEventListener("input", limitIconLength);
        document.getElementById("user-account-icon-input").addEventListener("blur", updateUserIcon);
    }
}

// Limit user icon length
function limitIconLength() {
    const iconInput = document.getElementById("user-account-icon-input");
    if (!iconInput) {
        console.error("Input element not found.");
        return;
    }

    // Sanitize: keep only alphanumeric characters and limit to 2 characters
    let value = iconInput.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2);
    iconInput.value = value;
}

// Edit icon
function updateUserIcon(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    const newUserIcon = document.getElementById("user-account-icon-input").value.trim();
    // Hide user icon input
    if (document.getElementById("user-account-icon-input-div"))
        document.getElementById("user-account-icon-input-div").style.display = "none";
    // Reconstruct user icon
    if (document.getElementById("user-account-icon")) {
        if (newUserIcon) document.getElementById("user-account-icon").innerHTML = newUserIcon;
        else document.getElementById("user-account-icon").innerHTML = '<i class="fas fa-user-alt"></i>';
        document.getElementById("user-account-icon").style.display = "flex";
    }
    // Keep popup and update database only when removed
}

// Edit name
function editUserName(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Remove user name label
    if (document.getElementById("user-account-name"))
        document.getElementById("user-account-name").style.display = "none";
    // Construct and focus on user name input
    if (document.getElementById("user-account-name-input")) {
        // Set input value
        document.getElementById("user-account-name-input").value = document.getElementById("user-account-name").textContent.trim();
        // Show user name input
        document.getElementById("user-account-name-input").style.display = "flex";
        // Focus
        document.getElementById("user-account-name-input").focus();
        // Add event listener
        document.getElementById("user-account-name-input").addEventListener("blur", updateUserName);
    }
}

// Update user name
function updateUserName(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    const newUserName = document.getElementById("user-account-name-input").value.trim();
    // Hide user name input
    if (document.getElementById("user-account-name-input"))
        document.getElementById("user-account-name-input").style.display = "none";
    // Reconstruct user name
    if (document.getElementById("user-account-name")) {
        if (newUserName) document.getElementById("user-account-name").innerHTML = `${newUserName}&nbsp;<i class="fas fa-pencil-alt button"></i>`;
        document.getElementById("user-account-name").style.display = "flex";
    }
    // Keep popup and update database only when removed
}

// Change password
function changeUserPassword(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Construct and focus on user password input
    if (document.getElementById("user-change-password-input")) {
        // Set input value
        document.getElementById("user-change-password-input").value = "";
        // Show user password input
        document.getElementById("user-change-password-input").style.opacity = "1";
        // Focus
        document.getElementById("user-change-password-input").focus();
        // Add event listener
        document.getElementById("user-change-password-input").addEventListener("blur", updatePassword);
    }
}

// Update password
function updatePassword(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Deconstruct user password input
    if (document.getElementById("user-change-password-input"))
        document.getElementById("user-change-password-input").style.opacity = "0";
}

// Check updated info
async function checkUpdatedInfo() {
    // Get previous user info
    let user = getLocalStorageUser();
    // Get updated user info
    const icon = document.getElementById("user-account-icon-input").value.trim();
    const name = document.getElementById("user-account-name-input").value.trim();
    const password = document.getElementById("user-change-password-input").value.trim();
    // Compare info
    let changed = false;
    if (icon && icon !== user.icon) { user.icon = icon; changed = true; };
    if (name && name !== user.name) { user.name = name; changed = true; };
    if (password && password !== user.password) { user.password = password; changed = true; };
    // Update user info
    if (changed) {
        // Show notification
        showNotification('Processing', 'info', 'wait');
        // Update user info
        console.log(user);
        const newUser = await updateUserApi(user);
        if (newUser) setLocalStorageUser(newUser);
        // Remove notification
        removeNotification();
    }
}

// Show delete account confirm
function showDeleteAccountConfirm(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
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

// Handle user account popup remove
function handleUserAccountPopupRemove() {
    // Check updated info
    checkUpdatedInfo();
    // Remove user account popup
    removeUserAccountPopup();
}

// Remove user account popup
function removeUserAccountPopup() {
    // Remove event listeners from user account popup
    // Close popup
    if (document.getElementById("close-user-account-popup"))
        document.getElementById("close-user-account-popup").removeEventListener("click", removeUserAccountPopup);
    // Icon
    if (document.getElementById("user-account-icon"))
        document.getElementById("user-account-icon").removeEventListener("click", editUserIcon);
    if (document.getElementById("user-account-icon-input"))
        document.getElementById("user-account-icon-input").removeEventListener("blur", updateUserIcon);
    if (document.getElementById("user-account-icon-input"))
        document.getElementById("user-account-icon-input").addEventListener("keydown", limitIconLength);
    // Name
    if (document.getElementById("user-account-name"))
        document.getElementById("user-account-name").removeEventListener("click", editUserName);
    if (document.getElementById("user-account-name-input"))
        document.getElementById("user-account-name-input").removeEventListener("blur", updateUserName);
    // Password
    if (document.getElementById("user-change-password"))
        document.getElementById("user-change-password").removeEventListener("click", changeUserPassword);
    if (document.getElementById("user-change-password-input"))
        document.getElementById("user-change-password-input").removeEventListener("blur", updatePassword);
    // Delete
    if (document.getElementById("delete-account"))
        document.getElementById("delete-account").removeEventListener("click", showDeleteAccountConfirm);
    if (document.getElementById("confirm-delete-account"))
        document.getElementById("confirm-delete-account").removeEventListener("click", deleteAccount);
    // Outside click
    document.removeEventListener('click', outsideClickHandler);
    // Escape key
    document.removeEventListener('keydown', escapeKeyHandler);
    // Remove popup container
    if (document.getElementById("user-account-popup"))
        document.getElementById("user-account-popup").remove();
}

// Outside click
function outsideClickHandler(e) {
    const userAccountPopup = document.getElementById("user-account-popup");
    if (e.target === userAccountPopup ) handleUserAccountPopupRemove();
}

// Escape key handler
function escapeKeyHandler(e) {
    if (e.key === "Escape") removeUserAccountPopup();
}