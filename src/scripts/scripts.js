// script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully');
    
    // DOM Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const signInModal = document.getElementById('sign-in-modal');
    const signUpModal = document.getElementById('sign-up-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const closeSignIn = document.getElementById('close-sign-in');
    const closeSignUp = document.getElementById('close-sign-up');
    const closeForgotPassword = document.getElementById('close-forgot-password');
    const switchToSignUp = document.getElementById('switch-to-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const showForgotPasswordLink = document.getElementById('show-forgot-password');
    const backToSignInLink = document.getElementById('back-to-sign-in');
    
    // Event Listeners for Modal Show/Hide
    [signInBtn, signUpBtn, switchToSignUp, switchToSignIn, showForgotPasswordLink, backToSignInLink]
        .forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideAllModals();
                    
                    if (this === signInBtn || this === switchToSignIn) {
                        signInModal.style.display = 'block';
                    } else if (this === signUpBtn || this === switchToSignUp) {
                        signUpModal.style.display = 'block';
                    } else if (this === showForgotPasswordLink) {
                        forgotPasswordModal.style.display = 'block';
                    } else if (this === backToSignInLink) {
                        signInModal.style.display = 'block';
                    }
                });
            }
        });
    
    [closeSignIn, closeSignUp, closeForgotPassword].forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            hideAllModals();
        });
    });
    
    // Get Started Button
    getStartedBtn?.addEventListener('click', function() {
        signUpModal.style.display = 'block';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            hideAllModals();
        }
    });
    
    // Form submission handlers
    document.getElementById('sign-in-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignIn();
    });
    
    document.getElementById('sign-up-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignUp();
    });
    
    document.getElementById('forgot-password-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleForgotPassword();
    });
    
    // Google Sign In/Up (Mock)
    document.getElementById('google-sign-in')?.addEventListener('click', function(e) {
        e.preventDefault();
        mockGoogleAuth('sign-in');
    });
    
    document.getElementById('google-sign-up')?.addEventListener('click', function(e) {
        e.preventDefault();
        mockGoogleAuth('sign-up');
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-links a').forEach(lnk => {
                lnk.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target section
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Form validation
    document.getElementById('sign-up-password')?.addEventListener('input', function() {
        const password = this.value;
        const isValid = validatePassword(password);
        const hint = document.querySelector('.password-hint');
        
        if (hint) {
            if (!isValid && password.length > 0) {
                hint.style.color = '#e74c3c';
            } else if (isValid) {
                hint.style.color = '#27ae60';
            } else {
                hint.style.color = '#888';
            }
        }
    });
    
    // Helper Functions
    function hideAllModals() {
        signInModal.style.display = 'none';
        signUpModal.style.display = 'none';
        forgotPasswordModal.style.display = 'none';
    }
    
    function sanitizeInput(input) {
        return input.replace(/[^\w\s@.-]/gi, '');
    }
    
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        return passwordRegex.test(password);
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    function mockGoogleAuth(type) {
        showNotification(`Google ${type === 'sign-in' ? 'Sign In' : 'Sign Up'} is not implemented yet, but would redirect to Google's authentication page in a real implementation.`, 'info');
    }
    
    function handleSignIn() {
        const emailInput = document.getElementById('sign-in-email');
        const passwordInput = document.getElementById('sign-in-password');
        
        if (!emailInput || !passwordInput) return;
        
        const email = sanitizeInput(emailInput.value);
        const password = passwordInput.value;
        
        if (!email || !password) {
            showNotification('Please fill in both email and password.', 'error');
            return;
        }
        
        showNotification('Signing in... (This is a mock function)', 'info');
        
        setTimeout(() => {
            const mockToken = btoa(JSON.stringify({ 
                email: email, 
                exp: Math.floor(Date.now() / 1000) + (60 * 60)
            }));
            
            localStorage.setItem('authToken', mockToken);
            
            showNotification('Sign in successful!', 'success');
            
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        }, 1000);
    }
    
    function handleSignUp() {
        const emailInput = document.getElementById('sign-up-email');
        const passwordInput = document.getElementById('sign-up-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (!emailInput || !passwordInput || !confirmPasswordInput) return;
        
        const email = sanitizeInput(emailInput.value);
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!email || !password || !confirmPassword) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password does not meet requirements.', 'error');
            return;
        }
        
        showNotification('Creating account... (This is a mock function)', 'info');
        
        setTimeout(() => {
            showNotification('Account created successfully! Please check your email for a confirmation link.', 'success');
            
            signUpModal.style.display = 'none';
            signInModal.style.display = 'block';
        }, 1000);
    }
    
    function handleForgotPassword() {
        const emailInput = document.getElementById('reset-email');
        
        if (!emailInput) return;
        
        const email = sanitizeInput(emailInput.value);
        
        if (!email) {
            showNotification('Please enter your email address.', 'error');
            return;
        }
        
        showNotification('Sending reset link... (This is a mock function)', 'info');
        
        setTimeout(() => {
            showNotification('A password reset link has been sent to your email.', 'success');
            
            forgotPasswordModal.style.display = 'none';
            signInModal.style.display = 'block';
        }, 1000);
    }
});