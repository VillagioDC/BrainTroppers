// LANDING PAGE MODAL SCRIPTS

// DOM Elements
const signInBtn = document.getElementById('sign-in-btn');
const signUpBtn = document.getElementById('sign-up-btn');
const signInModal = document.getElementById('sign-in-modal');
const signUpModal = document.getElementById('sign-up-modal');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const notificationModal = document.getElementById('notification-modal');
const closeSignIn = document.getElementById('close-sign-in');
const closeSignUp = document.getElementById('close-sign-up');
const closeForgotPassword = document.getElementById('close-forgot-password');
const closeNotification = document.getElementById('close-notification');
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

if (closeNotification) {
    closeNotification.addEventListener('click', () => {
        notificationModal.style.display = 'none';
    });
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        hideAllModals();
    }
});

// Helper Functions
function hideAllModals() {
    signInModal.style.display = 'none';
    signUpModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
}