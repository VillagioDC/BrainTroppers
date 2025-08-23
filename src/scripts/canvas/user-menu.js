// CANVAS
// USER MENU SCRIPT

(function() {
    // Elements
    const userIcon = document.getElementById("user-icon");
    let userMenuPopup = document.getElementById("user-menu-popup");
    let isUserMenuLoaded = false;

    // Set user icon
    function setUserIcon() {
        // Add event listeners
        if (userIcon) userIcon.addEventListener("click", toggleUserMenu);
        // Set user icon
        const user = getLocalStorageUser();
        if (user && user.icon) userIcon.innerHTML = user.icon
        else userIcon.innerHTML = '<i class="fas fa-user-alt"></i>';
    }

    function setUserPlan() {
        // Set user plan
        const user = getLocalStorageUser();
        if (user && user.plan && user.plan === "Pro Plan") {
            const userPlan = document.getElementById("user-plan");
            userPlan.innerHTML = `Pro Plan&nbsp;<i class="fas fa-crown"></i>`;
        }
    }

    // Toggle user menu
    async function toggleUserMenu(e) {
        e.stopPropagation();
        // Toggle user menu
        isUserMenuLoaded = !isUserMenuLoaded;
        // Show menu
        if (isUserMenuLoaded) {
            // Load user menu
            await loadUserMenu();
            // Add event listeners
            bindUserMenuEvents();
        // Remove menu
        } else {
            // Remove user menu
            removeUserMenu();
        }
    };

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

    // Bind event listeners to user menu items
    function bindUserMenuEvents() {
        // Add event listeners to user menu items
        if (document.getElementById("go-pro-plan"))
            document.getElementById("go-pro-plan").addEventListener("click", goProPlan);
        if (document.getElementById("user-account"))
            document.getElementById("user-account").addEventListener("click", userAccount);
        if (document.getElementById("theme-toggle"))
            document.getElementById("theme-toggle").addEventListener("click", themeToggle);
        if (document.getElementById("log-out"))
            document.getElementById("log-out").addEventListener("click", logOut);
        document.addEventListener('click', outsideClickHandler);
    }

    // Remove user menu HTML
    function removeUserMenu() {
        // Remove event listeners from user menu items
        if (document.getElementById("go-pro-plan"))
            document.getElementById("go-pro-plan").removeEventListener("click", goProPlan);
        if (document.getElementById("user-account"))
            document.getElementById("user-account").removeEventListener("click", userAccount);
        if (document.getElementById("theme-toggle"))
            document.getElementById("theme-toggle").removeEventListener("click", themeToggle);
        if (document.getElementById("log-out"))
            document.getElementById("log-out").removeEventListener("click", logOut);
        document.removeEventListener('click', outsideClickHandler);
        // Remove popup container
        if (userMenuPopup) userMenuPopup.remove();
        userMenuPopup = null;
        isUserMenuLoaded = false;
    }

    // Outside click handler
    function outsideClickHandler(e) {
        if (e.target.id !== "user-menu-popup") removeUserMenu();
    }

    // Go to Pro Plan page
    async function goProPlan() {
        // Load pro plan popup
        await loadProPlanPopup();
        // Bind event listeners
        bindProPlanPopupEvents();
        // Remove user menu
        removeUserMenu();
    }

    // Load pro plan popup
    async function loadProPlanPopup() {
        try {
            const response = await fetch('./src/snippets/pro-plan.html');
            if (!response.ok) throw new Error('Failed to load pro-plan.html');
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error('Error loading pro plan popup:', error);
        }
    }

    // Bind event listeners to pro plan popup
    function bindProPlanPopupEvents() {
        // Add event listeners to pro plan popup
        if (document.getElementById("pro-plan-form"))
            document.getElementById("pro-plan-form").addEventListener("submit", proPlanFormSubmit);
        if (document.getElementById("pro-plan-close"))
            document.getElementById("pro-plan-close").addEventListener("click", removeProPlanPopup);
    }

    // Submit pro plan form
    async function proPlanFormSubmit(e) {
        e.preventDefault();
        // Call API
        const result = await registerUserWaitlist();
        // Handle result
        if (!result || result.error) {
            // Error
            await showNotification('Failed to register', 'error');
        } else {
            // Registered
            await showNotification('Done', 'success');
        }
        removeProPlanPopup();
    }

    // Register user waitlist
    async function registerUserWaitlist() {
        try {
            // Set parameters
            const { userId, sessionToken } = getLocalStorageCredentials();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            };
            const body = { userId };
            //const url = `${process.env.API_URL}/userWaitlist`;
            const url = `http://localhost:8888/.netlify/functions/userWaitlist`;
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Get response
            return response.json();
        // Catch errors
        } catch (error) {
            console.error('Error registering user waitlist:', error);
            return false;
        }
    }

    // Remove pro plan popup
    function removeProPlanPopup() {
        // Remove event listeners
        if (document.getElementById("pro-plan-form"))
            document.getElementById("pro-plan-form").removeEventListener("submit", proPlanFormSubmit);
        if (document.getElementById("pro-plan-close"))
            document.getElementById("pro-plan-close").removeEventListener("click", removeProPlanPopup);
        // Remove pro plan popup
        document.getElementById("pro-plan-modal").remove();
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
        // Remove user menu
        removeUserMenu();
        // Redirect to sign in page
        window.location.href = "./index.html";
        // Remove local storage data
        removeLocalStorageData();
    }

    // On load
    setUserIcon();
    setUserPlan();

})();