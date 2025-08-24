// LANDING PAGE AUTHENTICATION MODULE
// AUTHENTICATION MAIN SCRIPT

// Import modules
import { signInBtnClick } from './src/scripts/auth/signInModal.js';
import { signUpBtnClick } from './src/scripts/auth/signUpModal.js';
import { checkNewPasswordUrlParameter } from './src/scripts/auth/newPasswordParameters.js';

// Main function
(function () {
    // Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');

    // Event listeners
    if (signInBtn) signInBtn.addEventListener('click', signInBtnClick);
    if (signUpBtn) signUpBtn.addEventListener('click', signUpBtnClick);

    // Check new password url parameter
    checkNewPasswordUrlParameter();
    
})();