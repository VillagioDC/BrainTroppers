// CANVAS
// USER MENU SCRIPT

// Initialize user menu
window.initUserMenu = function() {
    // Elements
    const userIcon = document.getElementById("user-icon");
    let userMenuPopup = document.getElementById("user-menu-popup");
    let isUserMenuLoaded = false;

    // Toggle user menu
    userIcon.addEventListener("click", async (e) => {
        e.stopPropagation();
        // Toggle user menu
        isUserMenuLoaded = !isUserMenuLoaded;
        // Show menu
        if (isUserMenuLoaded) {
            await loadUserMenu();
            addUserMenuListeners();
        } else {
            await removeUserMenu();
        }
    });

    // Fetch and load user menu HTML
    async function loadUserMenu() {
        try {
            const response = await fetch('./src/snippets/user-menu.html');
            if (!response.ok) throw new Error('failed to load user-menu.html');
            const html = await response.text();
            // Create popup container
            document.body.insertAdjacentHTML('beforeend', html);
            userMenuPopup = document.getElementById("user-menu-popup");
        } catch (error) {
            console.error('Error loading user menu:', error);
        }
    }

    // Add event listeners to user menu items
    function addUserMenuListeners() {
        // Add event listeners to user menu items
        document.getElementById("go-pro-plan").addEventListener("click", goProPlan);
        document.getElementById("user-account").addEventListener("click", userAccount);
        document.getElementById("theme-toggle").addEventListener("click", themeToggle);
        document.getElementById("log-out").addEventListener("click", logOut);
    }

    // Remove user menu HTML
    async function removeUserMenu() {
        // Remove event listeners from user menu items
        document.getElementById("go-pro-plan").removeEventListener("click", goProPlan);
        document.getElementById("user-account").removeEventListener("click", userAccount);
        document.getElementById("theme-toggle").removeEventListener("click", themeToggle);
        document.getElementById("log-out").removeEventListener("click", logOut);
        // Remove popup container
        userMenuPopup.remove();
        userMenuPopup = null;
        isUserMenuLoaded = false;
    }

    // Remove popups if clicked outside
    document.addEventListener("click", (e) => {
        if ( document.getElementById("user-menu-popup") &&
             !userMenuPopup.contains(e.target)) {
                removeUserMenu();
            }
    });

    // Go to Pro Plan page
    function goProPlan() {
        // Implement Pro Plan functionality
        console.log("Go to Pro Plan clicked");
        removeUserMenu();
    }

    // Go to User Account page
    function userAccount() {
        // Implement user account functionality
        console.log("Go to User Account clicked");
        removeUserMenu();
    }

    // Toggle dark mode
    function themeToggle() {
        // Implement dark mode functionality
        console.log("Toggle dark mode clicked");
        removeUserMenu();
    }

    // Log out
    function logOut() {
        // Implement log out functionality
        console.log("Log out clicked");
        removeUserMenu();
    }
}