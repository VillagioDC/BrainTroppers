// LANDING PAGE MODULE
// GET STARTED MODULE

// Import modules
import { setCanvasUrl } from '../common/setCanvasUrl.js';

// Get started button click handler
(function() {
    // Elements
    const getStartedBtn = document.getElementById('get-started-btn');

    // Event listeners
    getStartedBtn?.addEventListener('click', getStartButtonHandler);
    
    function getStartButtonHandler(e) { 
        e.preventDefault();
        window.location.href = setCanvasUrl();
    };

})();