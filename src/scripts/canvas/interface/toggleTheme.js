// CANVAS MODULES
// TOGGLE THEME MODULE

// Import modules
// No modules

export function toggleTheme() {
    // Elements
    const themeToggle = document.getElementById('theme-toggle');

    // Toggle to light mode
    if (themeToggle.contains('fa-moon')) {
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
        themeToggle.innerText = '&nbsp;Light Mode';
        // Implement changes on canvas
        // Implement changes on interface
        console.log('Toggle to light mode');

        // Toggle to dark mode
    } else if (themeToggle.contains('fa-sun')) {
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
        themeToggle.innerText = '&nbsp;Light Mode';
        // Implement changes on canvas
        // Implement changes on interface
        console.log('Toggle to dark mode');
    }
}