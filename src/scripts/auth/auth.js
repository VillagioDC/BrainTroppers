// LANDING PAGE AUTHENTICATION SCRIPTS

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

// Form validation (password hint)
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

function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
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
        
        document.getElementById('sign-up-modal').style.display = 'none';
        document.getElementById('sign-in-modal').style.display = 'block';
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
        
        document.getElementById('forgot-password-modal').style.display = 'none';
        document.getElementById('sign-in-modal').style.display = 'block';
    }, 1000);
}

// Helper Functions
function sanitizeInput(input) {
    return input.replace(/[^\w\s@.-]/gi, '');
}

// Notification
function showNotification(message, type = 'success') {
    const modal = document.getElementById('notification-modal');
    const content = document.querySelector('.notification-content');
    const msg = document.getElementById('notification-message');
    
    if (!modal || !content || !msg) return;
    
    msg.textContent = message;
    content.classList.remove('success', 'error', 'info');
    content.classList.add(type);
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }, 3000);
}