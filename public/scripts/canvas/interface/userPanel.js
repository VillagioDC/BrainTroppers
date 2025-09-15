// CANVAS MODULES
// USER MENU MODULE

// Import modules
import { toggleUserMenu } from "./userMenu.js";
import { getLocalStorageUser } from "../../common/userLocalStorage.js";
import { getUserPlan } from "../utils/getUserPlan.js";

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
        userIcon.innerHTML = '<i class="bi bi-person-fill"></i>';
    }

    // Set user plan
    const userPlanHtml = getUserPlan();
    userPlan.innerHTML = userPlanHtml;

})();