// CANVA SIDEBAR SCRIPT

const sidebar = document.getElementById("sidebar");
const collapseBtn = document.getElementById("collapseBtn");
const expandBtn = document.getElementById("expandBtn");
const logoOverlay = document.getElementById("logoOverlay");
let isCollapsed = false;

function toggleSidebar() {
  isCollapsed = !isCollapsed;
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
    collapseBtn.innerHTML = "<i class='fas fa-chevron-right'></i>";
    expandBtn.style.display = "flex";
    expandBtn.style.left = `${logoOverlay.offsetLeft + logoOverlay.offsetWidth + 10}px`;
  } else {
    sidebar.classList.remove("collapsed");
    collapseBtn.innerHTML = "<i class='fas fa-chevron-left'></i>";
    expandBtn.style.display = "none";
  }
}

collapseBtn.addEventListener("click", toggleSidebar);
expandBtn.addEventListener("click", () => {
  isCollapsed = false;
  sidebar.classList.remove("collapsed");
  collapseBtn.innerHTML = "<i class='fas fa-chevron-left'></i>";
  expandBtn.style.display = "none";
});