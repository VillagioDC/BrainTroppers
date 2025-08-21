// CANVA
// SIDEBAR SCRIPT

(function() {
  // Elements
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapse-btn");
  const expandBtn = document.getElementById("expand-btn");
  let isCollapsed = false;

  // Events
  collapseBtn.addEventListener("click", toggleSidebar);
  expandBtn.addEventListener("click", toggleSidebar);

  // Toggle sidebar
  function toggleSidebar() {
    // Toggle sidebar
    isCollapsed = !isCollapsed;
    // When collapsed
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
      collapseBtn.classList.add("collapsed");
      expandBtn.classList.add("collapsed");
    // When expanded
    } else {
      sidebar.classList.remove("collapsed");
      collapseBtn.classList.remove("collapsed");
      expandBtn.classList.remove("collapsed");
    }
  }
})();