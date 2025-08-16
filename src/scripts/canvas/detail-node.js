// CANVAS
// DETAIL NODE COMMAND

(function () {
  const detailBtn = document.getElementById('detail-node-btn');
  let modalLoaded = false;

  function loadModal() {
    return fetch('./canvas/detail-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        modalLoaded = true;
        bindEvents();
      });
  }

  function bindEvents() {
    const modal = document.getElementById('detail-node-popup');
    const closeBtn = document.getElementById('close-detail-node-popup');
    const submit = document.getElementById('detail-node-submit');
    const textarea = document.getElementById('detail-node-text');

    function open() {
      modal.style.display = 'block';
      textarea.value = mindMapCanvas.getSelectedDetail() || '';
      textarea.focus();
    }
    function close(save) {
      if (save) {
        const detail = textarea.value.trim();
        mindMapCanvas.setSelectedDetail(detail);
      }
      modal.style.display = 'none';
      textarea.value = '';
    }

    if (detailBtn) detailBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!modalLoaded) {
        loadModal().then(open);
      } else {
        open();
      }
    });
    if (closeBtn) closeBtn.addEventListener('click', () => close(true));
    if (submit) submit.addEventListener('click', () => close(true));

    window.addEventListener('click', (ev) => { if (ev.target === modal) close(true); });
  }

  if (detailBtn) {
    detailBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!modalLoaded) {
        loadModal().then(() => {
          const modal = document.getElementById('detail-node-popup');
          if (modal) modal.style.display = 'block';
        });
      } else {
        const modal = document.getElementById('detail-node-popup');
        if (modal) modal.style.display = 'block';
      }
    });
  }

})();
