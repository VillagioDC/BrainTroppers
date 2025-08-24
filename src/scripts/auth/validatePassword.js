// LANDING PAGE AUTHENTICATION MODULE
// AUTH PASSWORD UTILS MODULE

// Validate password
export function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
}

// Validate password input
export function validatePasswordInput(e) {
    const password = e.target.value;
    const isValid = validatePassword(password);
    const hint = document.querySelector('.password-hint');
    if (hint) {
        hint.textContent = 'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.';
        if (!isValid && password.length > 0) {
            hint.style.color = '#e74c3c';
        } else if (isValid) {
            hint.style.color = '#27ae60';
        } else {
            hint.style.color = '#888';
        }
    }
}
