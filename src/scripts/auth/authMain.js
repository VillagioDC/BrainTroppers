// LANDING PAGE AUTHENTICATION SCRIPT
// AUTHENTICATION MAIN SCRIPT

// Import modules
import { signInBtnClick } from './signInModal.js';
import { signUpBtnClick } from './signUpModal.js';
import { checkUrlQuery } from './checkUrlQuery.js';

// Main function
(function () {
    // Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');

    // Event listeners
    if (signInBtn) signInBtn.addEventListener('click', signInBtnClick);
    if (signUpBtn) signUpBtn.addEventListener('click', signUpBtnClick);

    // Check url parameter
    checkUrlQuery();

})();