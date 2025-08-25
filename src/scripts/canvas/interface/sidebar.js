// CANVA MODULES
// SIDEBAR MODULE

// Import modules
import { toggleSidebar } from './sidebarToggle.js';

(function() {
    // Elements
    const collapseBtn = document.getElementById("collapse-btn");
    const expandBtn = document.getElementById("expand-btn");
    // Events
    collapseBtn.addEventListener("click", toggleSidebar);
    expandBtn.addEventListener("click", toggleSidebar);

})();