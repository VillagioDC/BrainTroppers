// CANVAS MODULES
// TOGGLE LINK TYPE MODULE

// Import modules
// No modules

export async function directLink() {
    // Get selected edge
    const edgeId = braintroop.selected.id;
    if (!edgeId) { console.warn("No edge selected"); return; }
    const edge = braintroop.map.edges.find(e => e.id === edgeId);
    if (!edge) { console.warn("Edge not found in map"); return; }
    // Check if edge is already direct
    if (edge.type === "direct") return;
    // Toggle edge type to related
    braintroop.toggleEdgeType(edge.id);
}

export async function relatedLink() {
    // Get selected edge
    const edgeId = braintroop.selected.id;
    if (!edgeId) { console.warn("No edge selected"); return; }
    const edge = braintroop.map.edges.find(e => e.id === edgeId);
    if (!edge) { console.warn("Edge not found in map"); return; }
    // Check if edge is already direct
    if (edge.type === "related") return;
    // Toggle edge type to related
    braintroop.toggleEdgeType(edge.id);
}