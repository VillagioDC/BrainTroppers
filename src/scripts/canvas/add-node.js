// CANVAS
// ADD NODE COMMAND

(function () {
  const addBtn = document.getElementById('add-node-btn');
  let modalLoaded = false;

  function loadModal() {
    return fetch('./canvas/add-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        modalLoaded = true;
        bindEvents();
      });
  }

function bindEvents() {
    const modal = document.getElementById('add-node-popup');
    const closeBtn = document.getElementById('close-add-node-popup');
    const submit = document.getElementById('add-node-submit');
    const textarea = document.getElementById('add-node-text');

    function open() {
      modal.style.display = 'block';
      textarea.value = '';
      textarea.focus();
    }
    function close() {
      modal.style.display = 'none';
      textarea.value = '';
    }

    if (addBtn) addBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!modalLoaded) {
        loadModal().then(open);
      } else {
        open();
      }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (submit) submit.addEventListener('click', () => {
      const content = textarea.value.trim();
      if (content) {
        const id = `node-${Date.now()}`;
        const w = mindMapCanvas.canvas.offsetWidth, h = mindMapCanvas.canvas.offsetHeight;
        mindMapCanvas.addNode({ id, content, x: Math.random() * (w - 140) + 70, y: Math.random() * (h - 56) + 28 });
      }
      close();
    });

    window.addEventListener('click', (ev) => { if (ev.target === modal) close(); });
  }

  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!modalLoaded) {
        loadModal().then(() => {
          const modal = document.getElementById('add-node-popup');
          if (modal) modal.style.display = 'block';
        });
      } else {
        const modal = document.getElementById('add-node-popup');
        if (modal) modal.style.display = 'block';
      }
    });
  }
})();