// LANDING PAGE GET STARTED SCRIPT

// DOM Elements
const getStartedBtn = document.getElementById('get-started-btn');

// Get Started Button
getStartedBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    // Redirect to Canvas
    window.location.href = './canvas.html';
});
