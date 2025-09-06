// LANDING PAGE AUTHENTICATION SCRIPT
// AUTHENTICATION MAIN SCRIPT

// Import modules
import { checkUrlQuery } from './checkUrlQuery.js';

// Main function
(function () {
    // Elements
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');

    // Event listeners with lazy loading
    if (signInBtn) signInBtn.addEventListener('click', signInBtnClick);
    if (signUpBtn) signUpBtn.addEventListener('click', signUpBtnClick);

    // Check url parameter
    checkUrlQuery();

})();

async function signInBtnClick() {
    const { constructSignInModal } = await import ('./signInModal.js');
    constructSignInModal();
}

async function signUpBtnClick() {
    const { constructSignUpModal } = await import ('./signUpModal.js');
    constructSignUpModal();
}