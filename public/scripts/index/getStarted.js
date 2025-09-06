// LANDING PAGE GET STARTED MODULE

// Get started button click handler
(function() {
    // Element
    const getStartedBtn = document.getElementById('get-started-btn');
    // Add event listener
    getStartedBtn.addEventListener('click', getStartedBtnClickHandler);

})();

// Get started button click handler
async function getStartedBtnClickHandler() {
    // Open sign up modal
    const { constructSignUpModal } = await import('../auth/signUpModal.js');
    constructSignUpModal();
}