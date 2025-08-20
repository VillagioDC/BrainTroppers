// INITIAL NODES/EDGES
// Provides: window.NodeStore with getInitialData()

(function () {
  function getInitialData() {
    // mirrors your original example nodes & connections, now with 'detail' field
    return {
      projectId: 'hAHKnBgcC1ubh4Ch',
      nodes: [
        { id: '1', content: 'Project Core', detail: 'Main initiative', x: 300, y: 200 },
        { id: '2', content: 'Feature A',    detail: 'First feature',  x: 450, y: 300 },
        { id: '3', content: 'Feature B',    detail: 'Second feature', x: 150, y: 300 },
        { id: '4', content: 'Feature C',    detail: 'Third feature', x: 300, y: 400 },
      ],
      edges: [
        { id: 'edge-1-2', source: '1', target: '2', strength: 'strong' },
        { id: 'edge-1-3', source: '1', target: '3', strength: 'strong' },
        { id: 'edge-1-4', source: '1', target: '4', strength: 'weak' },
      ]
    };
  }

  window.NodeStore = { getInitialData };
})();
