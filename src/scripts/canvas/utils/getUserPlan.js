// CANVAS MODULES
// GET USER PLAN MODULE

// Import modules
import { getLocalStorageUser } from '../../common/userLocalStorage.js';

export function getUserPlan() {
    let planHtml = 'Free Plan&nbsp;<i class="fas fa-gift"></i>'
    const user = getLocalStorageUser();
    if (user && user.plan) {
        switch (user.plan) {
            case 'Pro Plan':
                planHtml = 'Pro Plan&nbsp;<i class="fas fa-crown pro-plan"></i';
                break;
            default:
                planHtml = 'Free Plan&nbsp;<i class="fas fa-gift"></i>';
                break;
        }
    }
    return planHtml;
}