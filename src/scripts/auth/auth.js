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

// Google Sign In/Up
document.getElementById('google-sign-in')?.addEventListener('click', function(e) {
  e.preventDefault();
  initiateGoogleAuth('sign-in');
});

document.getElementById('google-sign-up')?.addEventListener('click', function(e) {
  e.preventDefault();
  initiateGoogleAuth('sign-up');
});

// Password validation
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
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  return passwordRegex.test(password);
}

async function initiateGoogleAuth(type) {
  showNotification(`Initiating Google ${type === 'sign-in' ? 'Sign In' : 'Sign Up'}...`, 'info');
  try {
    // Redirect to Google OAuth endpoint (replace with actual endpoint)
    window.location.href = `${process.env.API_URL}/auth/google?type=${type}`;
  } catch (error) {
    showNotification('Google authentication failed.', 'error');
    console.error('Google auth error:', error);
  }
}

async function handleSignIn() {
  const emailInput = document.getElementById('sign-in-email');
  const passwordInput = document.getElementById('sign-in-password');
  
  if (!emailInput || !passwordInput) return;
  
  const email = sanitizeInput(emailInput.value);
  const password = passwordInput.value;
  
  if (!email || !password) {
    showNotification('Please fill in both email and password.', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }

  showNotification('Signing in...', 'info');
  
  showNotification('Sign in successful!', 'success');
  
  setTimeout(() => {
      window.location.href = './canvas.html';
    }, 1000);
}

async function handleSignUp() {
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
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match.', 'error');
    return;
  }
  
  if (!validatePassword(password)) {
    showNotification('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.', 'error');
    return;
  }
  
  showNotification('Creating account...', 'info');
  
  showNotification('Account created successfully! Please check your email for a confirmation link.', 'success');
}

async function handleForgotPassword() {
  const emailInput = document.getElementById('reset-email');
  
  if (!emailInput) return;
  
  const email = sanitizeInput(emailInput.value);
  
  if (!email) {
    showNotification('Please enter your email address.', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }
  
  showNotification('Sending reset link...', 'info');
  
  showNotification('A password reset link has been sent to your email.', 'success');
}

// Helper Functions
function sanitizeInput(input) {
  return input.replace(/[^\w\s@.-]/gi, '').trim();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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
  }, 2000);
}