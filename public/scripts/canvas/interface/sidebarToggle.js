// CANVAS MODULES
// TOGGLE SIDEBAR MODULE

export function toggleSidebar() {
    // Element
    const sidebar = document.getElementById("sidebar");
    const collapseBtn = document.getElementById("collapse-btn");
    const expandBtn = document.getElementById("expand-btn");
    // Check if sidebar is collapsed
    const isCollapsed = sidebar.classList.contains("collapsed");
    // When collapsed, remove class list
    if (isCollapsed) {
        sidebar.classList.remove("collapsed");
        collapseBtn.classList.remove("collapsed");
        expandBtn.classList.remove("collapsed");
        // New map container
        if (document.getElementById('new-map-container')) document.getElementById('new-map-container').classList.remove('collapsed');
    // When expanded, add class list
    } else {
        sidebar.classList.add("collapsed");
        collapseBtn.classList.add("collapsed");
        expandBtn.classList.add("collapsed");
        // New map container
        if (document.getElementById('new-map-container')) document.getElementById('new-map-container').classList.add('collapsed');
    }
}