// CANVAS MODULES
// GET USER PLAN MODULE

// Import modules
import { getLocalStorageUser } from '../../common/userLocalStorage.js';

export function getUserPlan() {
    let planHtml = 'Free Plan&nbsp;<i class="bi bi-gift-fill"></i>'
    const user = getLocalStorageUser();
    if (user && user.plan) {
        switch (user.plan) {
            case 'Pro Plan':
                planHtml = 'Pro Plan&nbsp;<i class="bi bi-trophy-fill"></i>';
                break;
            default:
                planHtml = 'Free Plan&nbsp;<i class="bi bi-gift-fill"></i>';
                break;
        }
    }
    return planHtml;
}