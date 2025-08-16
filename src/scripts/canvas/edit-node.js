// CANVAS
// EDIT NODE COMMAND

(function () {
  const editBtn = document.getElementById('edit-node-btn');
  let modalLoaded = false;

  function loadModal() {
    return fetch('./canvas/edit-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        modalLoaded = true;
        bindEvents();
      });
  }

  function bindEvents() {
    const modal = document.getElementById('edit-node-popup');
    const closeBtn = document.getElementById('close-edit-node-popup');
    const submit = document.getElementById('edit-node-submit');
    const textarea = document.getElementById('edit-node-text');

    function open() {
      modal.style.display = 'block';
      textarea.value = mindMapCanvas.getSelectedContent() || '';
      textarea.focus();
    }
    function close(save = true) {
      if (save) {
        const val = textarea.value.trim();
        if (val) mindMapCanvas.setSelectedContent(val);
        else mindMapCanvas.deleteSelected();
      }
      modal.style.display = 'none';
      textarea.value = '';
    }

    if (editBtn) editBtn.addEventListener('click', e => {
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

  if (editBtn) {
  editBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!modalLoaded) {
      loadModal().then(() => {
        const modal = document.getElementById('edit-node-popup');
        if (modal) modal.style.display = 'block';
      });
    } else {
      const modal = document.getElementById('edit-node-popup');
      if (modal) modal.style.display = 'block';
    }
  });
}

})();
