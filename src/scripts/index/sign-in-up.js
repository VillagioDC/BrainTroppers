// LANDING PAGE SIGN IN/UP SCRIPT

(function () {
    // Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    let signInModal = document.getElementById('sign-in-modal');
    let signUpModal = document.getElementById('sign-up-modal');
    let forgotPasswordModal = document.getElementById('forgot-password-modal');

    // Event listeners
    if (signInBtn) signInBtn.addEventListener('click', signInBtnClick);
    if (signUpBtn) signUpBtn.addEventListener('click', signUpBtnClick);

    // Open sign in modal
    async function signInBtnClick() {
        if (signInModal) return;
        if (signUpModal) removeSignUpModal();
        if (forgotPasswordModal) removeForgotPasswordModal();
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Open sign up modal
    async function signUpBtnClick() {
        if (signUpModal) return;
        if (signInModal) removeSignInModal();
        if (forgotPasswordModal) removeForgotPasswordModal();
        await loadSignUpModal();
        bindSignUpModalEvents();
        document.getElementById('sign-up-email').focus();
    }

    // Open forgot password modal
    async function forgotPasswordClick() {
        if (forgotPasswordModal) return;
        if (signInModal) removeSignInModal();
        if (signUpModal) removeSignUpModal();
        await loadForgotPasswordModal();
        bindForgotPasswordModalEvents();
        document.getElementById('reset-email').focus();
    }

    // Switch to sign up modal
    async function switchToSignUpClick() {
        if (signInModal) removeSignInModal();
        await loadSignUpModal();
        bindSignUpModalEvents();
        document.getElementById('sign-up-email').focus();
    }

    // Switch to sign in modal
    async function switchToSignInClick() {
        if (signUpModal) removeSignUpModal();
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Back to sign in
    async function backToSignInLinkClick() {
        if (forgotPasswordModal) removeForgotPasswordModal();
        await loadSignInModal();
        bindSignInModalEvents();
        document.getElementById('sign-in-email').focus();
    }

    // Load sign in modal
    async function loadSignInModal() {
        try {
            const res = await fetch('./src/snippets/sign-in-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            signInModal = document.getElementById('sign-in-modal');
        } catch (error) {
            console.error('Failed to load sign-in modal:', error);
        }
    }

    // Load sign up modal
    async function loadSignUpModal() {
        try {
            const res = await fetch('./src/snippets/sign-up-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            signUpModal = document.getElementById('sign-up-modal');
        } catch (error) {
            console.error('Failed to load sign-up modal:', error);
        }
    }

    // Load forgot password modal
    async function loadForgotPasswordModal() {
        try {
            const res = await fetch('./src/snippets/forgot-password-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
            forgotPasswordModal = document.getElementById('forgot-password-modal');
        } catch (error) {
            console.error('Failed to load forgot-password modal:', error);
        }
    }

    // Bind sign in modal events
    function bindSignInModalEvents() {
        const closeSignIn = document.getElementById('close-sign-in');
        const forgotPassword = document.getElementById('show-forgot-password');
        const switchToSignUp = document.getElementById('switch-to-sign-up');
        const signInForm = document.getElementById('sign-in-form');
        const googleSignIn = document.getElementById('google-sign-in');
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
        const closeSignUp = document.getElementById('close-sign-up');
        const switchToSignIn = document.getElementById('switch-to-sign-in');
        const signUpForm = document.getElementById('sign-up-form');
        const googleSignUp = document.getElementById('google-sign-up');
        const passwordInput = document.getElementById('sign-up-password');
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
        const closeForgotPassword = document.getElementById('close-forgot-password');
        const backToSignInLink = document.getElementById('back-to-sign-in');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
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
        const closeSignIn = document.getElementById('close-sign-in');
        const forgotPassword = document.getElementById('show-forgot-password');
        const switchToSignUp = document.getElementById('switch-to-sign-up');
        const signInForm = document.getElementById('sign-in-form');
        const googleSignIn = document.getElementById('google-sign-in');
        if (closeSignIn) closeSignIn.removeEventListener('click', closeSignInClick);
        if (forgotPassword) forgotPassword.removeEventListener('click', forgotPasswordClick);
        if (switchToSignUp) switchToSignUp.removeEventListener('click', switchToSignUpClick);
        if (signInForm) signInForm.removeEventListener('submit', handleSignIn);
        if (googleSignIn) googleSignIn.removeEventListener('click', initiateGoogleAuth);
        document.removeEventListener('click', outsideClickHandler);
        if (signInModal) {
            signInModal.remove();
            signInModal = null;
        }
    }

    // Remove sign up modal
    function removeSignUpModal() {
        const closeSignUp = document.getElementById('close-sign-up');
        const switchToSignIn = document.getElementById('switch-to-sign-in');
        const signUpForm = document.getElementById('sign-up-form');
        const googleSignUp = document.getElementById('google-sign-up');
        const passwordInput = document.getElementById('sign-up-password');
        if (closeSignUp) closeSignUp.removeEventListener('click', closeSignUpClick);
        if (switchToSignIn) switchToSignIn.removeEventListener('click', switchToSignInClick);
        if (signUpForm) signUpForm.removeEventListener('submit', handleSignUp);
        if (googleSignUp) googleSignUp.removeEventListener('click', initiateGoogleAuth);
        if (passwordInput) passwordInput.removeEventListener('input', validatePasswordInput);
        document.removeEventListener('click', outsideClickHandler);
        if (signUpModal) {
            signUpModal.remove();
            signUpModal = null;
        }
    }

    // Remove forgot password modal
    function removeForgotPasswordModal() {
        const closeForgotPassword = document.getElementById('close-forgot-password');
        const backToSignInLink = document.getElementById('back-to-sign-in');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (closeForgotPassword) closeForgotPassword.removeEventListener('click', closeForgotPasswordClick);
        if (backToSignInLink) backToSignInLink.removeEventListener('click', backToSignInLinkClick);
        if (forgotPasswordForm) forgotPasswordForm.removeEventListener('submit', handleForgotPassword);
        document.removeEventListener('click', outsideClickHandler);
        if (forgotPasswordModal) {
            forgotPasswordModal.remove();
            forgotPasswordModal = null;
        }
    }

    // Close modal on outside click
    function outsideClickHandler(e) {
        if ((signInModal && !signInModal.contains(e.target)) ||
            (signUpModal && !signUpModal.contains(e.target)) ||
            (forgotPasswordModal && !forgotPasswordModal.contains(e.target))) {
            closeSignInClick();
            closeSignUpClick();
            closeForgotPasswordClick();
        }
    }

    // Validation and API functions (moved from auth.js)
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        return passwordRegex.test(password);
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function sanitizeInput(input) {
        return input.replace(/[^\w\s@.-]/gi, '').trim();
    }

    async function apiSignIn(email, password) {
        try {
            const credentials = { email, password };
            const url = 'http://localhost:8888/.netlify/functions';
            const response = await fetch(`${url}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Sign-in failed: ${error.message}`);
        }
    }

    async function apiSignUp(email, password) {
        try {
            const credentials = { email, password };
            const url = 'http://localhost:8888/.netlify/functions';
            const response = await fetch(`${url}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Sign-up failed: ${error.message}`);
        }
    }

    async function apiForgotPassword(email) {
        try {
            const url = 'http://localhost:8888/.netlify/functions';
            const response = await fetch(`${url}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

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

    async function handleSignIn() {
        try {
            const emailInput = document.getElementById('sign-in-email');
            const passwordInput = document.getElementById('sign-in-password');
            if (!emailInput || !passwordInput) {
                throw new Error('Form elements not found');
            }
            const email = sanitizeInput(emailInput.value);
            const password = passwordInput.value;
            if (!email || !password) {
                throw new Error('Please fill in email and password');
            }
            if (!validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            await showNotification('Signing in...', 'info', 'wait');
            const result = await apiSignIn(email, password);
            await showNotification('Sign in successful!', 'success');
            setTimeout(() => {
                window.location.href = './canvas.html';
            }, 2000);
        } catch (error) {
            await showNotification(error.message, 'error');
            console.error('Sign in error:', error);
        }
    }

    async function handleSignUp() {
        try {
            const emailInput = document.getElementById('sign-up-email');
            const passwordInput = document.getElementById('sign-up-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            if (!emailInput || !passwordInput || !confirmPasswordInput) {
                throw new Error('Form elements not found');
            }
            const email = sanitizeInput(emailInput.value);
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            if (!email || !password || !confirmPassword) {
                throw new Error('Please fill in all fields');
            }
            if (!validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (!validatePassword(password)) {
                throw new Error('Password must be at least 8 characters, include an uppercase letter, a number, and a special character');
            }
            await showNotification('Creating account...', 'info', 'wait');
            await apiSignUp(email, password);
            await showNotification('Account created successfully! Please check your email for a confirmation link.', 'success');
        } catch (error) {
            await showNotification(error.message, 'error');
            console.error('Sign up error:', error);
        }
    }

    async function handleForgotPassword() {
        try {
            const emailInput = document.getElementById('reset-email');
            if (!emailInput) {
                throw new Error('Form element not found');
            }
            const email = sanitizeInput(emailInput.value);
            if (!email) {
                throw new Error('Please enter your email address');
            }
            if (!validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            await showNotification('Sending reset link...', 'info', 'wait');
            await apiForgotPassword(email);
            await showNotification('A password reset link has been sent to your email.', 'success');
        } catch (error) {
            await showNotification(error.message, 'error');
            console.error('Forgot password error:', error);
        }
    }

    async function showNotification(message, type = 'success', action = null) {
        try {
            if (!document.getElementById('notification-popup')) {
                await loadNotificationModal();
            }
            const popup = document.getElementById('notification-popup');
            const msg = document.getElementById('notification-message');
            const icon = document.getElementById('notification-icon');
            if (!popup || !msg || !icon) {
                throw new Error('Notification elements not found');
            }
            msg.textContent = message;
            popup.classList.remove('success', 'error', 'info');
            popup.classList.add(type);
            icon.classList.remove('fa-spinner', 'fa-check-circle', 'fa-exclamation-circle', 'fa-info-circle');
            if (action === 'wait') {
                icon.classList.add('fa-spinner');
            } else {
                icon.classList.add(
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle'
                );
            }
            setTimeout(() => {
                popup.remove();
            }, 3000);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    async function loadNotificationModal() {
        try {
            const res = await fetch('./src/snippets/notification-popup.html');
            if (!res.ok) {
                throw new Error('Failed to fetch notification modal');
            }
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error('Failed to load notification popup:', error);
            throw error;
        }
    }
})();