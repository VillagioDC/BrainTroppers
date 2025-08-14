// CANVAS MAP MENU SCRIPT

document.querySelectorAll(".map-item").forEach(item => {
  item.addEventListener("click", function (e) {
    const isMenuClick = e.target.closest('.map-menu-btn') || 
                        e.target.closest('.map-menu-popup') ||
                        e.target.closest('.menu-item');
    if (isMenuClick) return;
    
    document.querySelector(".map-item.active")?.classList.remove("active");
    this.classList.add("active");
    
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

document.querySelectorAll(".map-menu-btn").forEach(btn => {
  const popupId = btn.closest(".map-item")?.getAttribute("data-menu-id");
  const popup = document.getElementById(popupId);
  if (!popup) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    
    document.querySelectorAll(".map-menu-popup.show").forEach(p => {
      if (p !== popup) p.classList.remove("show");
    });
    document.querySelectorAll(".map-menu-btn").forEach(b => {
      if (b !== btn) b.setAttribute("aria-expanded", "false");
    });
    
    const shouldShow = !isExpanded;
    popup.classList.toggle("show", shouldShow);
    btn.setAttribute("aria-expanded", shouldShow);
    
    if (shouldShow) {
      positionMenuPopup(popup, btn);
    }
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

function positionMenuPopup(popup, btn) {
  const btnRect = btn.getBoundingClientRect();
  const spaceBelow = window.innerHeight - btnRect.bottom;
  const spaceAbove = btnRect.top;
  const popupHeight = popup.offsetHeight;
  const left = btnRect.left + window.scrollX + (btnRect.width / 2) - 10;
  
  if (spaceBelow >= popupHeight) {
    popup.style.top = `${btnRect.bottom + window.scrollY}px`;
  } else if (spaceAbove >= popupHeight) {
    popup.style.top = `${btnRect.top + window.scrollY - popupHeight}px`;
  } else {
    popup.style.top = `${Math.max(10, window.scrollY + 10)}px`;
    popup.style.maxHeight = `${window.innerHeight - 20}px`;
  }
  
  popup.style.left = `${left}px`;
  popup.style.width = "180px";
}

document.addEventListener("click", () => {
  document.querySelectorAll(".map-menu-popup.show").forEach(popup => {
    popup.classList.remove("show");
  });
  document.querySelectorAll(".map-menu-btn").forEach(btn => {
    btn.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".map-list").addEventListener("scroll", () => {
  document.querySelectorAll(".map-menu-popup.show").forEach(p => {
    p.classList.remove("show");
  });
  document.querySelectorAll(".map-menu-btn").forEach(btn => {
    btn.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".map-menu-popup").forEach(popup => {
  popup.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", function(e) {
    e.preventDefault();
    const popup = this.closest(".map-menu-popup");
    const menuBtn = document.querySelector(`.map-item [data-menu-id="${popup.id}"] ~ .map-menu-container .map-menu-btn`);
    const mapItem = menuBtn?.closest(".map-item");
    
    if (mapItem) {
      const action = this.getAttribute("data-action") || "unknown";
      const mapName = mapItem.textContent.trim().replace(/\s+/g, ' ').trim();
      console.log(`Performing ${action} on map: ${mapName}`);
      
      popup.classList.remove("show");
      if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
      }
    }
  });
});