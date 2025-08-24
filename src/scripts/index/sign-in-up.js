// LANDING PAGE SIGN IN/UP SCRIPT

(function () {
    // Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    let signInModal = document.getElementById('sign-in-modal');
    let signUpModal = document.getElementById('sign-up-modal');
    let forgotPasswordModal = document.getElementById('forgot-password-modal');
    let newPasswordModal = document.getElementById('new-password-modal');

    // Event listeners
    if (signInBtn) signInBtn.addEventListener('click', signInBtnClick);
    if (signUpBtn) signUpBtn.addEventListener('click', signUpBtnClick);

    // Open sign in modal
    async function signInBtnClick() {
        // Remove opened modals
        if (signInModal) return;
        if (signUpModal) removeSignUpModal();
        if (forgotPasswordModal) removeForgotPasswordModal();
        // Load sign in modal
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Open sign up modal
    async function signUpBtnClick() {
        // Remove opened modals
        if (signUpModal) return;
        if (signInModal) removeSignInModal();
        if (forgotPasswordModal) removeForgotPasswordModal();
        // Load sign up modal
        await loadSignUpModal();
        bindSignUpModalEvents();
        document.getElementById('sign-up-email').focus();
    }

    // Open forgot password modal
    async function forgotPasswordClick() {
        // Remove opened modals
        if (forgotPasswordModal) return;
        if (signInModal) removeSignInModal();
        if (signUpModal) removeSignUpModal();
        // Load forgot password modal
        await loadForgotPasswordModal();
        bindForgotPasswordModalEvents();
        document.getElementById('reset-email').focus();
    }

    // Switch to sign up modal
    async function switchToSignUpClick() {
        // Remove sign in modal
        if (signInModal) removeSignInModal();
        // Load sign up modal
        await loadSignUpModal();
        bindSignUpModalEvents();
        document.getElementById('sign-up-email').focus();
    }

    // Switch to sign in modal
    async function switchToSignInClick() {
        // Remove sign up modal
        if (signUpModal) removeSignUpModal();
        // Load sign in modal
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Back to sign in
    async function backToSignInLinkClick() {
        // Remove forgot password modal
        if (forgotPasswordModal) removeForgotPasswordModal();
        // Load sign in modal
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Load sign in modal
    async function loadSignInModal() {
        try {
            // Load sign in modal
            const res = await fetch('./src/snippets/sign-in-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            signInModal = document.getElementById('sign-in-modal');
        // Catch error
        } catch (error) {
            console.error('Failed to load sign-in modal:', error);
        }
    }

    // Load sign up modal
    async function loadSignUpModal() {
        try {
            // Load sign up modal
            const res = await fetch('./src/snippets/sign-up-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            signUpModal = document.getElementById('sign-up-modal');
        // Catch error
        } catch (error) {
            console.error('Failed to load sign-up modal:', error);
        }
    }

    // Load forgot password modal
    async function loadForgotPasswordModal() {
        try {
            // Load forgot password modal
            const res = await fetch('./src/snippets/forgot-password-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            forgotPasswordModal = document.getElementById('forgot-password-modal');
        // Catch error
        } catch (error) {
            console.error('Failed to load forgot-password modal:', error);
        }
    }

    // Bind sign in modal events
    function bindSignInModalEvents() {
        // Elements
        const closeSignIn = document.getElementById('close-sign-in');
        const forgotPassword = document.getElementById('show-forgot-password');
        const switchToSignUp = document.getElementById('switch-to-sign-up');
        const signInForm = document.getElementById('sign-in-form');
        const googleSignIn = document.getElementById('google-sign-in');
        // Event listeners
        if (closeSignIn) closeSignIn.addEventListener('click', closeSignInClick);
        if (forgotPassword) forgotPassword.addEventListener('click', forgotPasswordClick);
        if (switchToSignUp) switchToSignUp.addEventListener('click', switchToSignUpClick);
        if (signInForm) signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSignIn();
        });
        if (googleSignIn) googleSignIn.addEventListener('click', async (e) => {
            e.preventDefault();
            await initiateGoogleAuth('sign-in');
        });
        document.addEventListener('click', outsideClickHandler);
    }

    // Bind sign up modal events
    function bindSignUpModalEvents() {
        // Elements
        const closeSignUp = document.getElementById('close-sign-up');
        const switchToSignIn = document.getElementById('switch-to-sign-in');
        const signUpForm = document.getElementById('sign-up-form');
        const googleSignUp = document.getElementById('google-sign-up');
        const passwordInput = document.getElementById('sign-up-password');
        // Event listeners
        if (closeSignUp) closeSignUp.addEventListener('click', closeSignUpClick);
        if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
        if (signUpForm) signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSignUp();
        });
        if (googleSignUp) googleSignUp.addEventListener('click', async (e) => {
            e.preventDefault();
            await initiateGoogleAuth('sign-up');
        });
        if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
        document.addEventListener('click', outsideClickHandler);
    }

    // Bind forgot password modal events
    function bindForgotPasswordModalEvents() {
        // Elements
        const closeForgotPassword = document.getElementById('close-forgot-password');
        const backToSignInLink = document.getElementById('back-to-sign-in');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        // Event listeners
        if (closeForgotPassword) closeForgotPassword.addEventListener('click', closeForgotPasswordClick);
        if (backToSignInLink) backToSignInLink.addEventListener('click', backToSignInLinkClick);
        if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleForgotPassword();
        });
        document.addEventListener('click', outsideClickHandler);
    }

    // Password validation
    function validatePasswordInput(e) {
        const password = e.target.value;
        const isValid = validatePassword(password);
        const hint = document.querySelector('.password-hint');
        if (hint) {
            hint.textContent = 'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.';
            if (!isValid && password.length > 0) {
                hint.style.color = '#e74c3c';
            } else if (isValid) {
                hint.style.color = '#27ae60';
            } else {
                hint.style.color = '#888';
            }
        }
    }

    // Close sign in modal
    function closeSignInClick() {
        if (signInModal) removeSignInModal();
    }

    // Close sign up modal
    function closeSignUpClick() {
        if (signUpModal) removeSignUpModal();
    }

    // Close forgot password modal
    function closeForgotPasswordClick() {
        if (forgotPasswordModal) removeForgotPasswordModal();
    }

    // Remove sign in modal
    function removeSignInModal() {
        // Elements
        const closeSignIn = document.getElementById('close-sign-in');
        const forgotPassword = document.getElementById('show-forgot-password');
        const switchToSignUp = document.getElementById('switch-to-sign-up');
        const signInForm = document.getElementById('sign-in-form');
        const googleSignIn = document.getElementById('google-sign-in');
        // Event listeners
        if (closeSignIn) closeSignIn.removeEventListener('click', closeSignInClick);
        if (forgotPassword) forgotPassword.removeEventListener('click', forgotPasswordClick);
        if (switchToSignUp) switchToSignUp.removeEventListener('click', switchToSignUpClick);
        if (signInForm) signInForm.removeEventListener('submit', handleSignIn);
        if (googleSignIn) googleSignIn.removeEventListener('click', initiateGoogleAuth);
        document.removeEventListener('click', outsideClickHandler);
        // Remove modal
        if (signInModal) {
            signInModal.remove();
            signInModal = null;
        }
    }

    // Remove sign up modal
    function removeSignUpModal() {
        // Elements
        const closeSignUp = document.getElementById('close-sign-up');
        const switchToSignIn = document.getElementById('switch-to-sign-in');
        const signUpForm = document.getElementById('sign-up-form');
        const googleSignUp = document.getElementById('google-sign-up');
        const passwordInput = document.getElementById('sign-up-password');
        // Event listeners
        if (closeSignUp) closeSignUp.removeEventListener('click', closeSignUpClick);
        if (switchToSignIn) switchToSignIn.removeEventListener('click', switchToSignInClick);
        if (signUpForm) signUpForm.removeEventListener('submit', handleSignUp);
        if (googleSignUp) googleSignUp.removeEventListener('click', initiateGoogleAuth);
        if (passwordInput) passwordInput.removeEventListener('input', validatePasswordInput);
        document.removeEventListener('click', outsideClickHandler);
        // Remove modal
        if (signUpModal) {
            signUpModal.remove();
            signUpModal = null;
        }
    }

    // Remove forgot password modal
    function removeForgotPasswordModal() {
        // Elements
        const closeForgotPassword = document.getElementById('close-forgot-password');
        const backToSignInLink = document.getElementById('back-to-sign-in');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        // Event listeners
        if (closeForgotPassword) closeForgotPassword.removeEventListener('click', closeForgotPasswordClick);
        if (backToSignInLink) backToSignInLink.removeEventListener('click', backToSignInLinkClick);
        if (forgotPasswordForm) forgotPasswordForm.removeEventListener('submit', handleForgotPassword);
        document.removeEventListener('click', outsideClickHandler);
        // Remove modal
        if (forgotPasswordModal) {
            forgotPasswordModal.remove();
            forgotPasswordModal = null;
        }
    }

    // Close modal on outside click
    function outsideClickHandler(e) {
        if (signInModal && !signInModal.querySelector('.modal-content').contains(e.target)) {
            removeSignInModal();
        }
        if (signUpModal && !signUpModal.querySelector('.modal-content').contains(e.target)) {
            removeSignUpModal();
        }
        if (forgotPasswordModal && !forgotPasswordModal.querySelector('.modal-content').contains(e.target)) {
            removeForgotPasswordModal();
        }
        if (newPasswordModal && !newPasswordModal.querySelector('.modal-content').contains(e.target)) {
            removeNewPasswordModal();
        }
    }

    // Google authentication
    // Pending
    async function apiGoogleAuth(type) {
        try {
            const url = 'http://localhost:8888/.netlify/functions';
            const response = await fetch(`${url}/auth/google?type=${type}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Google authentication failed: ${error.message}`);
        }
    }

    // Initiate Google authentication
    // Pending
    async function initiateGoogleAuth(type) {
        try {
            await showNotification(`Initiating Google ${type === 'sign-in' ? 'Sign In' : 'Sign Up'}...`, 'info', 'wait');
            const result = await apiGoogleAuth(type);
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                await showNotification('Google authentication successful!', 'success');
                setTimeout(() => {
                    window.location.href = './canvas.html';
                }, 2000);
            }
        } catch (error) {
            await showNotification(error.message, 'error');
            console.error('Google auth error:', error);
        }
    }

    // Handle sign in
    async function handleSignIn() {
        // Get form values
        const emailInput = document.getElementById('sign-in-email');
        const passwordInput = document.getElementById('sign-in-password');
        // Validate
        if (!emailInput || !passwordInput) {
            throw new Error('Form element missing');
        }
        // Normalize
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;
        // Validate
        if (!email || !password) {
            await showNotification('Invalid credentials', 'error');
            console.log('Invalid credentials');
            return;
        }
        // Validate email
        if (!validateEmail(email)) {
            await showNotification('Invalid email', 'error');
            console.log('Invalid email');
            return;
        }
        // Validate password
        if (!validatePassword(password)) {
            await showNotification('Invalid password', 'error');
            console.log('Invalid password');
            return;
        }
        // Sign in
        await showNotification('Signing in', 'info', 'wait');
        const result = await apiSignIn(email, password);
        // Handle result
        if (!result) {
            // If error on API
            await showNotification('Sign in error', 'error');
            console.log('Sign in error');
            return;
        } else if (result && result.error) {
            // If wrong request or wrong credentials
            await showNotification(result.error, 'error');
            console.log(result.error);
            return;
        // Handle success
        } else {
            // Set user and session
            setLocalStorageUser(result.auth);
            // Navigate to canvas
            if (localStorage.getItem('braintroop-user')) {
                // Show notification
                await showNotification('Signing in', 'success');
                // Redirect
                setTimeout(() => {
                    window.location.href = './canvas.html';
                }, 2000);                    
            }
        }
    }

    // Normalize email
    function normalizeEmail(input) {
        return input.trim().toLowerCase();
    }

    // Validate email
    function validateEmail(email) {
        if (email.length > 254) return false;
        const dangerousChars = /['";<>\(\)]/;
        if (dangerousChars.test(email)) return false;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) return false;
        return true;
    }

    // Validate password
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        return passwordRegex.test(password);
    }

    // API call to sign in
    async function apiSignIn(email, password) {
        try {
            // Set Parameters
            const headers = {
                'Content-Type': 'application/json',
            };
            const body = { credentials: { email, password }};
            //const url = `${process.env.API_URL}/signIn`;
            const url = 'http://localhost:8888/.netlify/functions/signIn';
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response) {
                throw new Error(await response.text());
            }
            return await response.json();
        // Catch error
        } catch (error) {
            throw new Error('Sign-in error:', error);
        }
    }

    // Set local storage user
    function setLocalStorageUser(user) {
        // Validate user object
        if (!user || typeof user !== 'object') {
            console.error('Invalid user object for local storage');
            return;
        }
        // Store user object in local storage
        localStorage.setItem('braintroop-user', JSON.stringify(user));
    } 

    // Handle sign up
    async function handleSignUp() {
        // Get form values
        const emailInput = document.getElementById('sign-up-email');
        const passwordInput = document.getElementById('sign-up-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (!emailInput || !passwordInput || !confirmPasswordInput) {
            throw new Error('Form element missing');
        }
        // Validate
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!email || !password || !confirmPassword) {
            await showNotification('Missing credentials', 'error');
            console.log('Missing credentials');
            return;
        }
        if (!validateEmail(email)) {
            await showNotification('Invalid email address', 'error');
            console.log('Invalid email address');
            return;
        }
        if (password !== confirmPassword) {
            await showNotification('Passwords do not match', 'error');
            console.log('Passwords do not match');
            return;
        }
        if (!validatePassword(password)) {
            await showNotification('Invalid password', 'error');
            console.log('Invalid password');
            return;
        }
        // Sign up
        await showNotification('Creating account', 'info', 'wait');
        // Call API
        const result = await apiSignUp(email, password);
        // Handle result
        if (!result) {
            await showNotification('Sign up error', 'error');
            console.log('Sign up error');
        } else if (result && result.error) {
            // If wrong request or wrong credentials
            await showNotification(result.error, 'error');
            console.log(result.error);
        // Handle success
        } else {
            // Show notification
            await showNotification('Verification email sent', 'success');
            // Show sign in modal
            setTimeout(() => {
                switchToSignInClick();
            }, 2000);
        }
    }

    // API call to sign up
    async function apiSignUp(email, password) {
        try {
            // Set Parameters
            const headers = {
                'Content-Type': 'application/json',
            };
            const body = { credentials: { email, password }};
            //const url = `${process.env.API_URL}/signUp`;
            const url = 'http://localhost:8888/.netlify/functions/signUp';
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response) {
                throw new Error(await response.text());
            }
            // Return response
            return await response.json();
        // Catch error
        } catch (error) {
            throw new Error('Sign-up error:', error);
        }
    }

    // Handle forgot password
    async function handleForgotPassword() {
        // Get form values
        const emailInput = document.getElementById('reset-email');
        if (!emailInput) {
            throw new Error('Form element missing');
        }
        // Validate
        const email = normalizeEmail(emailInput.value);
        if (!email) {
            await showNotification('Missing email address', 'error');
            console.log('Missing email address');
            return;
        }
        if (!validateEmail(email)) {
            await showNotification('Invalid email address', 'error');
            console.log('Invalid email address');
            return;
        }
        // Call API
        await showNotification('Reseting access', 'info', 'wait');
        const result = await apiForgotPassword(email);
        // Handle result
        if (!result) {
            // Error
            await showNotification('Password reset failed', 'error');
        } else if (result && result.error) {
            await showNotification(result.error, 'error');
        } else {
            // Pending
            await showNotification('Verification email sent', 'success');
        }
        // Remove modal
        removeForgotPasswordModal();
    }

    // API call to forgot password
    async function apiForgotPassword(email) {
        try {
            // Set Parameters
            const headers = {
                'Content-Type': 'application/json',
            };
            const body = { credentials: { email }};
            //const url = `${process.env.API_URL}/forgotPassword`;
            const url = 'http://localhost:8888/.netlify/functions/forgotPassword';
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response) {
                throw new Error(await response.text());
            }
            // Return response
            return await response.json();
        // Catch error
        } catch (error) {
            throw new Error('Password reset error:', error);
        }
    }

    // Check reset password url parameter
    async function checkNewPasswordUrlParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const newPassword = urlParams.get('newPassword');
        const authToken = urlParams.get('authToken');
        if (newPassword && authToken) {
            // Clean url
            const cleanedUrl = window.location.origin;
            window.history.replaceState({}, document.title, cleanedUrl);
            // Show reset password modal
            await showNewPasswordModal(authToken);
        }
    }

    // Show reset password modal
    async function showNewPasswordModal(authToken) {
        // Remove opened modals
        if (forgotPasswordModal) removeForgotPasswordModal();
        if (signInModal) removeSignInModal();
        if (signUpModal) removeSignUpModal();
        // Load reset password modal
        await loadNewPasswordModal(authToken);
        if (!newPasswordModal) return;
        // Bind events
        bindNewPasswordModalEvents();
    }
    // Load reset password modal
    async function loadNewPasswordModal(authToken) {
        try {
            // Load reset password modal
            const res = await fetch('./src/snippets/new-password-modal.html');
            let html = await res.text();
            if (!html) return;
            // Replace auth token
            html = html.replace('{{authToken}}', authToken);
            document.body.insertAdjacentHTML('beforeend', html);
            newPasswordModal = document.getElementById('new-password-modal');
        // Catch error
        } catch (error) {
            console.error('Failed to load new-password modal:', error);
        }
    }

    // Bind reset password modal events
    function bindNewPasswordModalEvents() {
        // Elements
        const closeNewPassword = document.getElementById('close-new-password');
        const switchToSignIn = document.getElementById('switch-to-sign-in');
        const newPasswordForm = document.getElementById('new-password-form');
        const passwordInput = document.getElementById('new-password');
        // Event listeners
        if (closeNewPassword) closeNewPassword.addEventListener('click', closeNewPasswordClick);
        if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
        if (newPasswordForm) newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleNewPassword();
        });
        if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
        document.addEventListener('click', outsideClickHandler);
    }

    // Close new password modal
    function closeNewPasswordClick() {
        if (newPasswordModal) removeNewPasswordModal();
    }

    // Handle new password
    async function handleNewPassword() {
        // Get form values
        const emailInput = document.getElementById('new-password-email');
        const passwordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const authToken = document.querySelector('#new-password-form').getAttribute('data-auth-token');
        if (!emailInput || !passwordInput || !confirmPasswordInput || !authToken) {
            throw new Error('Form element missing');
        }
        // Validate
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!email || !password || !confirmPassword) {
            await showNotification('Missing credentials', 'error');
            console.log('Missing credentials');
            return;
        }
        if (!validateEmail(email)) {
            await showNotification('Invalid email address', 'error');
            console.log('Invalid email address');
            return;
        }
        if (password !== confirmPassword) {
            await showNotification('Passwords do not match', 'error');
            console.log('Passwords do not match');
            return;
        }
        if (!validatePassword(password)) {
            await showNotification('Invalid password', 'error');
            console.log('Invalid password');
            return;
        }
        // Sign up
        await showNotification('Updating password', 'info', 'wait');
        // Call API
        const result = await apiNewPassword(email, password, authToken);
        // Handle result
        if (!result) {
            await showNotification('Password update failed', 'error');
            console.log('Reset password error');
        } else if (result && result.error) {
            // If wrong request or wrong credentials
            await showNotification(result.error, 'error');
        // Handle success
        } else {
            // Show notification
            await showNotification('Password updated', 'success');
            // Show sign in modal
            setTimeout(() => {
                switchToSignInClick();
            }, 2000);
        }
        // Remove new password modal
        removeNewPasswordModal();
    }

    // Handle new password
    async function apiNewPassword(email, password) {
        try {
            // Set Parameters
            const headers = {
                'Content-Type': 'application/json',
            };
            const body = { credentials: { email, password }};
            //const url = `${process.env.API_URL}/setNewPassword`;
            const url = 'http://localhost:8888/.netlify/functions/setNewPassword';
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // Check response
            if (!response) {
                throw new Error(await response.text());
            }
            // Return response
            return await response.json();
        // Catch error
        } catch (error) {
            throw new Error('Password update error:', error);
        }
    }

    // Remove new password modal
    function removeNewPasswordModal() {
        // Remove event listeners
        if (document.getElementById('close-new-password'))
            document.getElementById('close-new-password').removeEventListener('click', closeNewPasswordClick);
        if (document.getElementById('switch-to-sign-in'))
            document.getElementById('switch-to-sign-in').removeEventListener('click', switchToSignInClick);
        if (document.getElementById('new-password-form'))
            document.getElementById('new-password-form').removeEventListener('submit', handleNewPassword);
        if (document.getElementById('new-password'))
            document.getElementById('new-password').removeEventListener('input', validatePasswordInput);
        document.removeEventListener('click', outsideClickHandler);
        // Remove modal
        if (newPasswordModal) {
            newPasswordModal.remove();
            newPasswordModal = null;
        }
    }

    // On load
    checkNewPasswordUrlParameter();

})();