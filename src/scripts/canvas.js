document.addEventListener('DOMContentLoaded', () => {
  // Helper: dynamic script loader
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  // Load scripts in dependent stages
  const loadStages = [
    // Stage 1: Core dependencies
    () => Promise.all([
      loadScript("https://d3js.org/d3.v7.min.js")
    ]),
    // Stage 2: Braintroop and initial interface
    () => Promise.all([
      loadScript('./src/scripts/canvas/braintroop.js'),
      import('./canvas/interface/sidebar.js')
    ]),
    // Stage 3: Examples
    () => Promise.all([
      import('./canvas/commands/braintroopApi.js'),
      import('./canvas/utils/loadExampleMap.js')
    ]),
    // Stage 4: Additional interface components
    () => Promise.all([
      import('./canvas/interface/userPanel.js'),
      import('./canvas/interface/mapList.js'),
      import('./canvas/interface/newMap.js'),
      import('./canvas/interface/zoom.js')
    ]),
    // Stage 5: Popups and command scripts
    () => Promise.all([
      import('./canvas/interface/userMenu.js'),
      import('./canvas/interface/mapListPopup.js'),
      loadScript('./src/scripts/canvas/detail-node.js'),
      loadScript('./src/scripts/canvas/add-node.js'),
      loadScript('./src/scripts/canvas/expand-node.js'),
      loadScript('./src/scripts/canvas/rewrite-node.js'),
      loadScript('./src/scripts/canvas/delete-node.js'),
      loadScript('./src/scripts/canvas/connect-node.js'),
      loadScript('./src/scripts/canvas/disconnect-node.js'),
      loadScript('./src/scripts/canvas/rewire-all.js')
    ])
  ];

  // Execute stages sequentially
  loadStages.reduce((promise, stage) => 
    promise.then(() => stage().catch(error => {
      console.error('Error in stage:', error);
      throw error;
    })), Promise.resolve())
    .then(() => {
      console.log('Canvas loaded successfully.');
    })
    .catch(error => {
      console.error('Error loading canvas:', error);
    });
});