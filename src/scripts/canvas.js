// script.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapseBtn");
  const expandBtn = document.getElementById("expandBtn");
  const logoOverlay = document.getElementById("logoOverlay");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const canvas = document.getElementById("canvas");
  const userIcon = document.getElementById("userIcon");
  const userMenuPopup = document.getElementById("userMenuPopup");
  let isCollapsed = false;
  
  // Collapse/expand functionality
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
  
  // === IMPROVED MAP MENU POPUP SYSTEM ===
  document.querySelectorAll(".map-menu-btn").forEach(btn => {
    const popupId = btn.closest(".map-item")?.getAttribute("data-menu-id");
    const popup = document.getElementById(popupId);
    if (!popup) return;
    
    // Toggle popup on click
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      
      // Close all other popups
      document.querySelectorAll(".map-menu-popup.show").forEach(p => {
        if (p !== popup) p.classList.remove("show");
      });
      document.querySelectorAll(".map-menu-btn").forEach(b => {
        if (b !== btn) b.setAttribute("aria-expanded", "false");
      });
      
      // Toggle current
      const shouldShow = !isExpanded;
      popup.classList.toggle("show", shouldShow);
      btn.setAttribute("aria-expanded", shouldShow);
      
      if (shouldShow) {
        positionMenuPopup(popup, btn);
      }
    });
    
    // Support keyboard (Enter/Space)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });
  
  // Position the popup with flip logic
  function positionMenuPopup(popup, btn) {
    const btnRect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - btnRect.bottom;
    const spaceAbove = btnRect.top;
    const popupHeight = popup.offsetHeight;
    const left = btnRect.left + window.scrollX + (btnRect.width / 2) - 10;
    
    if (spaceBelow >= popupHeight) {
      // Open below
      popup.style.top = `${btnRect.bottom + window.scrollY}px`;
    } else if (spaceAbove >= popupHeight) {
      // Open above
      popup.style.top = `${btnRect.top + window.scrollY - popupHeight}px`;
    } else {
      // Force fit in viewport
      popup.style.top = `${Math.max(10, window.scrollY + 10)}px`;
      popup.style.maxHeight = `${window.innerHeight - 20}px`;
    }
    
    popup.style.left = `${left}px`;
    popup.style.width = "180px";
  }
  
  // Close map popups on outside click
  document.addEventListener("click", () => {
    document.querySelectorAll(".map-menu-popup.show").forEach(popup => {
      popup.classList.remove("show");
    });
    document.querySelectorAll(".map-menu-btn").forEach(btn => {
      btn.setAttribute("aria-expanded", "false");
    });
  });
  
  // Close on scroll
  document.querySelector(".map-list").addEventListener("scroll", () => {
    document.querySelectorAll(".map-menu-popup.show").forEach(p => {
      p.classList.remove("show");
    });
    document.querySelectorAll(".map-menu-btn").forEach(btn => {
      btn.setAttribute("aria-expanded", "false");
    });
  });
  
  // Map item selection
  document.querySelectorAll(".map-item").forEach(item => {
    item.addEventListener("click", function (e) {
      const isMenuClick = e.target.closest('.map-menu-btn') || 
                         e.target.closest('.map-menu-popup') ||
                         e.target.closest('.menu-item');
      if (isMenuClick) return;
      
      document.querySelector(".map-item.active")?.classList.remove("active");
      this.classList.add("active");
      
      // Update menu button visibility
      document.querySelectorAll(".map-item").forEach(item => {
        const menuBtn = item.querySelector(".map-menu-btn");
        if (item.classList.contains("active")) {
          menuBtn.classList.remove("hidden");
        } else {
          menuBtn.classList.add("hidden");
        }
      });
    });
  });
  
  // User menu functionality
  userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenuPopup.classList.toggle("active");
    const expanded = userIcon.getAttribute("aria-expanded") === "true";
    userIcon.setAttribute("aria-expanded", !expanded);
  });
  
  // Close user menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userMenuPopup.contains(e.target)) {
      userMenuPopup.classList.remove("active");
      userIcon.setAttribute("aria-expanded", "false");
    }
  });
  
  // Theme toggle functionality
  document.querySelector(".theme-toggle").addEventListener("click", (e) => {
    e.preventDefault();
    const icon = document.querySelector(".theme-toggle i");
    const text = document.querySelector(".theme-toggle");
    if (icon.classList.contains("fa-moon")) {
      icon.classList.replace("fa-moon", "fa-sun");
      text.textContent = " Light Mode";
    } else {
      icon.classList.replace("fa-sun", "fa-moon");
      text.textContent = " Dark Mode";
    }
    document.body.classList.toggle("light-mode");
  });
  
  // Zoom Controls
  let scale = 1;
  const minScale = 0.5;
  const maxScale = 2;
  const step = 0.1;
  
  zoomIn.addEventListener("click", () => {
    if (scale < maxScale) {
      scale += step;
      applyZoom();
    }
  });
  
  zoomOut.addEventListener("click", () => {
    if (scale > minScale) {
      scale -= step;
      applyZoom();
    }
  });
  
  function applyZoom() {
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = "center";
  }
  
  // Panning
  let isPanning = false;
  let startX, startY, scrollLeft, scrollTop;
  
  canvas.addEventListener("mousedown", (e) => {
    if (e.target === canvas || e.target.classList.contains("grid")) {
      isPanning = true;
      canvas.style.cursor = "grabbing";
      startX = e.pageX - canvas.offsetLeft;
      startY = e.pageY - canvas.offsetTop;
      scrollLeft = canvas.scrollLeft;
      scrollTop = canvas.scrollTop;
    }
  });
  
  canvas.addEventListener("mouseleave", () => {
    isPanning = false;
    canvas.style.cursor = "default";
  });
  
  canvas.addEventListener("mouseup", () => {
    isPanning = false;
    canvas.style.cursor = "default";
  });
  
  canvas.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    canvas.scrollLeft = scrollLeft - walkX;
    canvas.scrollTop = scrollTop - walkY;
  });
  
  // Prevent menu clicks from propagating
  document.querySelectorAll(".map-menu-popup, .user-menu-popup").forEach(popup => {
    popup.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
  
  // Handle menu item clicks with reference to the source map-item
  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function(e) {
      e.preventDefault();
      // Get the map item associated with this menu
      const popup = this.closest(".map-menu-popup");
      const menuBtn = document.querySelector(`.map-item [data-menu-id="${popup.id}"] ~ .map-menu-container .map-menu-btn`);
      const mapItem = menuBtn?.closest(".map-item");
      
      if (mapItem) {
        const action = this.getAttribute("data-action") || "unknown";
        const mapName = mapItem.textContent.trim().replace(/\s+/g, ' ').trim();
        console.log(`Performing ${action} on map: ${mapName}`);
        
        // Here you would implement the actual functionality
        // Close the popup after selection
        popup.classList.remove("show");
        if (menuBtn) {
          menuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
  
  // Initialize zoom
  applyZoom();
});