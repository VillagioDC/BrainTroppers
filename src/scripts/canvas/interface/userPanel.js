// CANVAS MODULES
// USER MENU MODULE

// Import modules
import { toggleUserMenu } from "./userMenu.js";
import { getLocalStorageUser } from "../../common/userLocalStorage.js";

(function() {
    // Elements
    const userIcon = document.getElementById("user-icon");
    const userPlan = document.getElementById('user-plan');
    
    // Add event listeners
    if (userIcon) userIcon.addEventListener("click", toggleUserMenu);
    
    // Get user
    const user = getLocalStorageUser();

    // Set user icon
    if (user && user.icon) {
        userIcon.innerHTML = user.icon
    } else {
        userIcon.innerHTML = '<i class="fas fa-user-alt"></i>';
    }

    // Set user plan
    let planHtml = "";
    if (user && user.plan) {
        switch (user.plan) {
            case 'Pro Plan':
                planHtml = 'Pro Plan&nbsp;<i class="fas fa-crown pro-plan"></i>';
                break;
            default:
                planHtml = 'Free Plan&nbsp;<i class="fas fa-gift"></i>';
                break;
        }
        userPlan.innerHTML = planHtml;
    }

})();