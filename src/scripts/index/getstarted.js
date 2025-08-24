// LANDING PAGE GET STARTED MODULE

// Get started button click handler
(function() {
    const getStartedBtn = document.getElementById('get-started-btn');

    getStartedBtn?.addEventListener('click', getStartButtonHandler);
    
    function getStartButtonHandler(e) { 
        e.preventDefault();
        window.location.href = './canvas.html';
    };

})();