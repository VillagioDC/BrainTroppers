// BrainTroop Interactive Mind Map Canvas using D3.js v7
// Reorganized & documented version

import { openNodeToolsMenu, removeNodeToolsMenu } from './interface/nodeToolsMenu.js';
import { openLinkToolsMenu, removeLinkToolsMenu } from './interface/linkToolsMenu.js';
import { endLinkCommand } from './commands/linkNode.js';
import { pinNode } from './commands/pinNode.js';

(function () {
  // Require d3 v7
  if (typeof d3 === "undefined") {
    throw new Error("d3.js v7 is required by braintroop.js");
  }

  /* braintroop class
   * - Responsible for rendering an interactive mindmap on an SVG canvas using D3 v7.
   * - Internals are grouped by: CONFIG, D3 INIT, GRID, FORCES, BINDING (nodes/edges),
   *   RENDER / TICK logic, PERSISTENCE & CONVERSION utilities, and PUBLIC API.
   */
  class braintroop {
    // -------------------- CONSTRUCTOR & CORE CONFIG --------------------
    constructor(canvasSelector = "#canvas") {
      // Canvas DOM element
      this.canvas = document.querySelector(canvasSelector);
      if (!this.canvas) throw new Error(`Canvas element not found: ${canvasSelector}`);

      // UI sizing / grid defaults
      this.canvas.style.overflow = "hidden";
      this.gridSpacing = 50;
      this.nodeWidth = 146;   // default node size
      this.nodeHeight = 46;
      this.nodeWidthMax = 196;  // max node size
      this.nodeHeightMax = 96;
      this.nodeBorderRadius = 10;
      this.hiddenNodeWidth = 30;  // hidden node size (circle)
      this.hiddenNodeHeight = 30;
      this.hiddenNodeBorderRadius = 5;
      this.nodeSnapOffset = { x: this.nodeWidth / 2, y: this.nodeHeight / 2 };
      this.nodeMargin = 2;

      // Palette (themes) and color schemes
      this.palette = {
        dark: {
          canvas: { bg: "none", gridDot: "#657b9b" },
          node: { fill: "#1f2f45", stroke: "#3a4d6a", text: "#e0e0e0", selected: "#54c3eb" },
          edge: { stroke: "#3a4d6a", strokeSelected: "#54c3eb", style: "solid" } },
        light: {
          canvas: { bg: "none", gridDot: "#7d9cc5" },
          node: { fill: "#f3f6fa", stroke: "#d5dce5", text: "#1a1a1a", selected: "#00a3d4" },
          edge: { stroke: "#d5dce5", strokeSelected: "#00a3d4", style: "solid" } } };
      // Color schemes
      // Logo palette #c36cf9, #e13f8b, #723ce8, #fc9933, #ffc827, #4ec4ec, #549ec1
      this.colorSchemes = [
        { "name":"charcoal",   "fill": "#2e2f2f", "stroke": "#686869", "strokeSelected": "#cacbcb", "text": "#e0e0e0" },
        { "name":"pearl",      "fill": "#f3f6fa", "stroke": "#d5dce5", "strokeSelected": "#ffffff", "text": "#1a1a1a" },
        { "name":"ocean",      "fill": "#1f2f45", "stroke": "#3a4d6a", "strokeSelected": "#54c3eb", "text": "#e0e0e0" },
        { "name":"caribean",   "fill": "#549ec1", "stroke": "#3b6f87", "strokeSelected": "#a7d0e5", "text": "#1a1a1a" },
        { "name":"amethyst",   "fill": "#723ce8", "stroke": "#502a9e", "strokeSelected": "#c3b4f9", "text": "#ffffff" },
        { "name":"sky",        "fill": "#4ec4ec", "stroke": "#3789a3", "strokeSelected": "#a7e1ea", "text": "#1a1a1a" },
        { "name":"eggplant",   "fill": "#4a2655", "stroke": "#32193a", "strokeSelected": "#b787c9", "text": "#ffffff" },
        { "name":"lavender",   "fill": "#c36cf9", "stroke": "#8a4daa", "strokeSelected": "#ffffff", "text": "#1a1a1a" },
        { "name":"tangerine",  "fill": "#fc9933", "stroke": "#b46d25", "strokeSelected": "#ffe0b3", "text": "#1a1a1a" },
        { "name":"sunflower",  "fill": "#ffc827", "stroke": "#b38c1c", "strokeSelected": "#fff4cc", "text": "#1a1a1a" },
        { "name":"wine",       "fill": "#5a181f", "stroke": "#3a1015", "strokeSelected": "#e04b57", "text": "#ffffff" },
        { "name":"cherry",     "fill": "#ab1540", "stroke": "#6b1c33", "strokeSelected": "#e05c7c", "text": "#ffffff" },
        { "name":"emerald",    "fill": "#0a7a5a", "stroke": "#075940", "strokeSelected": "#80e0c0", "text": "#ffffff" },
        { "name":"lime",       "fill": "#7dbf4f", "stroke": "#5a8a39", "strokeSelected": "#d9f7b0", "text": "#1a1a1a" },
        { "name":"flame",      "fill": "#e13f8b", "stroke": "#a12b62", "strokeSelected": "#ffffff", "text": "#ffffff" },
        { "name":"fog",        "fill": "#7a8c99", "stroke": "#5f717e", "strokeSelected": "#c2d0dc", "text": "#ffffff" },
      ];

      // Theme defaults
      this.currentTheme = "dark";
      this.currentColorSchemeName = "eggplant";

      // Map model stored in-canvas
      this.map = {
        projectId: null,
        owner: null,
        colabs: [],
        userPrompt: "",
        title: "",
        lastUpdated: null,
        selectedNode: null,
        nodes: [],
        edges: []
      };

      // Backend metadata for conversions
      this.backendMeta = {};

      // Interaction/render state variables
      this.onSelect = null;
      this.selected = { type: null, id: null };
      this._pendingConnectionFrom = null;
      this.onMove = null;

      // D3 selections / simulation placeholders (set in _initD3)
      this.svg = null;
      this.g = null;
      this.gridG = null;
      this.edgesG = null;
      this.nodesG = null;
      this.selectionRect = null;
      this.simulation = null;
      this.zoom = null;
      this.linkForce = null;
      this.chargeForce = null;
      this.collideForce = null;
      this.forcesActive = false;

      // Initialize d3 elements and forces
      this._initD3();

      // Initial render (full)
      this.updateMap(true);

      // Keep grid up-to-date on resize
      this._onResizeBound = () => this._onResize();
      window.addEventListener("resize", this._onResizeBound);
    }

    // -------------------- D3 INITIALIZATION & SETUP --------------------
    _initD3() {
      if (!this.canvas) throw new Error("Canvas element not found");
      // Clear the canvas container
      this.canvas.innerHTML = "";

      // Create an SVG that fills the container
      this.svg = d3.select(this.canvas)
        .append("svg")
        .attr("id", "braintroop-svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("display", "block")
        .style("background", "none")
        .style("cursor", "grab");

      // Root group for transforms (pan/zoom)
      this.g = this.svg.append("g").attr("class", "root-g");

      // Grid group (dotted grid)
      this.gridG = this.g.append("g").attr("class", "dot-grid");
      this._updateDotGrid();

      // Arrow marker definition for edges (colored dynamically in setTheme)
      const defs = this.svg.append("defs");
      defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 10)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", this.palette[this.currentTheme].edge.stroke);

      // Groups for edges and nodes
      this.edgesG = this.g.append("g").attr("class", "edges");
      this.nodesG = this.g.append("g").attr("class", "nodes");

      // D3 zoom behavior: pan/zoom with cursor feedback
      this.zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on("start", (event) => { this.svg.style("cursor", "grabbing"); })
        .on("zoom", (event) => { this.g.attr("transform", event.transform); })
        .on("end", (event) => { 
          if (this._pendingConnectionFrom) { this.svg.style("cursor", "crosshair"); }
          else { this.svg.style("cursor", "grab"); }
        });

      // Attach zoom behavior to the svg
      this.svg.call(this.zoom);

      // Background click clears selection and cancels pending connection
      this.svg.on("click", (ev) => {
        this._setSelected({type: null, id: null});
        this._cancelPendingConnection();
      });

      // Force simulation basics (link, charge, collide, custom magnetic)
      this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.nodeId).distance(160).strength(0))
        .force("charge", d3.forceManyBody().strength(0))
        .force("collide", d3.forceCollide(d => {
          const mapNode = d.__mapNode || {};
          const r = (mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth) * 0.6;
          return r;
        }).strength(0))
        .force("magnetic", this._magneticForce.bind(this));

      // Hold references to adjust strengths during drag
      this.linkForce = this.simulation.force("link");
      this.chargeForce = this.simulation.force("charge");
      this.collideForce = this.simulation.force("collide");

      // Ensure locked nodes remain immobile during ticks
      this.simulation.on("tick.enforceLocked", () => {
        const simNodes = this.simulation.nodes() || [];
        for (const n of simNodes) {
          const mapNode = n && n.__mapNode;
          if (mapNode && mapNode.locked === true) {
            // If fx/fy provided keep in place; else use mapNode coords
            if (typeof n.fx === "number" && typeof n.fy === "number") {
              n.x = n.fx; n.y = n.fy;
            } else if (typeof mapNode.x === "number" && typeof mapNode.y === "number") {
              n.x = mapNode.x; n.y = mapNode.y;
              n.fx = mapNode.x; n.fy = mapNode.y;
            }
            n.vx = 0; n.vy = 0;
          }
        }
      });
    }

    // -------------------- GRID MANAGEMENT --------------------
    _updateDotGrid() {
      // Remove any existing grid defs
      this.svg.select("defs#grid-defs").remove();

      // Create grid pattern definition
      const defs = this.svg.append("defs").attr("id", "grid-defs");
      defs.append("pattern")
        .attr("id", "grid-pattern")
        .attr("width", this.gridSpacing)
        .attr("height", this.gridSpacing)
        .attr("patternUnits", "userSpaceOnUse")
        .append("circle")
        .attr("cx", 0.5)
        .attr("cy", 0.5)
        .attr("r", 1.2)
        .style("fill", this.palette[this.currentTheme].canvas.gridDot)
        .style("opacity", 0.5);

      // Apply background rect with grid pattern fill
      const bbox = this.canvas.getBoundingClientRect();
      const width = Math.max(bbox.width, window.innerWidth * 2);
      const height = Math.max(bbox.height, window.innerHeight * 2);

      const bg = this.gridG.selectAll("rect.grid-bg").data([0]);
      bg.enter()
        .append("rect")
        .attr("class", "grid-bg")
        .merge(bg)
        .attr("width", width)
        .attr("height", height)
        .attr("x", -width / 2)
        .attr("y", -height / 2)
        .style("fill", "url(#grid-pattern)");
    }

    // -------------------- FORCES: enable/disable drag forces & magnetic force --------------------
    _enableDragForces(draggingNode = null) {
      // Activate stronger forces for repositioning while dragging
      this.forcesActive = true;
      if (this.linkForce && this.linkForce.strength) this.linkForce.strength(0.1);
      if (this.chargeForce && this.chargeForce.strength) this.chargeForce.strength(-200);
      if (this.collideForce && this.collideForce.strength) this.collideForce.strength(1);

      // Pin locked nodes (so they stay in place during simulation)
      const simNodes = this.simulation.nodes() || [];
      simNodes.forEach(n => {
        try {
          if (n && n.__mapNode && n.__mapNode.locked === true) {
            const mapNode = n.__mapNode;
            if (draggingNode && n.nodeId === draggingNode) {
              // If we are dragging a locked node, ensure it has fx/fy already
              if (typeof n.fx !== "number" || typeof n.fy !== "number") {
                const px = (typeof mapNode.x === "number") ? mapNode.x : n.x;
                const py = (typeof mapNode.y === "number") ? mapNode.y : n.y;
                n.fx = px; n.fy = py; n.x = px; n.y = py; n.vx = 0; n.vy = 0;
              }
            } else {
              const px = (typeof mapNode.x === "number") ? mapNode.x : n.x;
              const py = (typeof mapNode.y === "number") ? mapNode.y : n.y;
              n.fx = px; n.fy = py; n.x = px; n.y = py; n.vx = 0; n.vy = 0;
            }
          }
        } catch (e) { /* defensive */ }
      });
      this.simulation.alphaTarget(0.3).restart();
    }

    _disableDragForces() {
      // Reset forces to neutral after dragging
      this.forcesActive = false;
      if (this.linkForce && this.linkForce.strength) this.linkForce.strength(0);
      if (this.chargeForce && this.chargeForce.strength) this.chargeForce.strength(0);
      if (this.collideForce && this.collideForce.strength) this.collideForce.strength(0);
      this.simulation.alphaTarget(0);
    }

    _magneticForce(alpha) {
      // A custom force to gently snap nodes to the grid and repel from locked nodes
      if (!this.map.nodes || !this.forcesActive) return;
      const simNodes = this.simulation.nodes() || [];
      if (!simNodes || simNodes.length === 0) return;

      // Collect locked node positions
      const lockedNodes = [];
      for (const n of simNodes) {
        if (!n || !n.__mapNode) continue;
        if (n.__mapNode.locked === true) {
          const lx = (typeof n.fx === "number") ? n.fx : n.x;
          const ly = (typeof n.fy === "number") ? n.fy : n.y;
          lockedNodes.push({ x: lx, y: ly });
        }
      }

      // Parameters for magnetic behavior
      const gridSpacing = this.gridSpacing;
      const repelRadius = Math.max(this.nodeWidth, this.nodeHeight) * 1.2;
      const repelStrength = 0.6;
      const gridPull = 0.05;

      for (const n of simNodes) {
        if (!n || !n.__mapNode) continue;
        const mapNode = n.__mapNode;
        if (mapNode.locked === true) continue; // locked nodes are static

        // Grid pull: gently push toward nearest grid point
        const gx = Math.round(n.x / gridSpacing) * gridSpacing;
        const gy = Math.round(n.y / gridSpacing) * gridSpacing;
        const dxg = gx - n.x;
        const dyg = gy - n.y;
        n.vx += dxg * gridPull * alpha;
        n.vy += dyg * gridPull * alpha;

        // Repel from locked nodes
        if (lockedNodes.length > 0) {
          for (const ln of lockedNodes) {
            const dx = n.x - ln.x;
            const dy = n.y - ln.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 === 0) {
              // small jitter if overlapping exactly
              n.vx += (Math.random() - 0.5) * 0.1;
              n.vy += (Math.random() - 0.5) * 0.1;
              continue;
            }
            const dist = Math.sqrt(dist2);
            if (dist < repelRadius) {
              const nx = dx / dist;
              const ny = dy / dist;
              const strength = (1 - dist / repelRadius) * repelStrength * alpha;
              n.vx += nx * strength;
              n.vy += ny * strength;
            }
          }
        }
      }
    }

    // -------------------- EMIT SELECTION & NODE MOVE --------------------
    _sanitizeNode(n) {
      // Remove internal d3 references before emitting to host
      if (!n) return null;
      const { __d3node, __containerNode, __mapNode, ...rest } = n;
      return rest;
    }

    _enrichEdgeForEmit(e) {
      // Prepare edge payload with lightweight source/target nodes
      if (!e) return null;
      const src = this.map.nodes.find(n => n.nodeId === e.source) || null;
      const tgt = this.map.nodes.find(n => n.nodeId === e.target) || null;
      return {
        nodeId: e.nodeId,
        source: e.source,
        target: e.target,
        type: e.type || "direct",
        sourceNode: this._sanitizeNode(src),
        targetNode: this._sanitizeNode(tgt)
      };
    }

    // Apply the selection visuals + menus without re-emitting
    _applySelectionUI() {
      if (!this.selected) {
        // Remove node and link tools menus
        removeNodeToolsMenu();
        removeLinkToolsMenu();
      } else if (this.selected.type === "node") {
        // Remove link tools menu
        removeLinkToolsMenu();
        // Open node tools menu
        const nodeId = this.selected.id;
        const node = nodeId ? this.map.nodes.find(n => n.nodeId === nodeId) : null;
        openNodeToolsMenu(node);
      } else if (this.selected.type === "edge") {
        // Remove node tools menu
        removeNodeToolsMenu();
        // Open link tools menu
        const edgeId = this.selected.id;
        const edge = edgeId ? this.map.edges.find(e => e.id === edgeId) : null;
        openLinkToolsMenu(edge);
      }

      // Repaint strokes/highlights
      this._paintSelection();
    }

    // Convenience wrapper to change selected target
    _setSelected({type, id}) {
        // Null selection
        if (type === null || id === null) {
          this.selected = null;
          this._applySelectionUI(null, null);
          return;
        }
        // Emit select by element or none
        if (type === "node") {
          this.selected = { type, id };
          this._applySelectionUI(id, null);
        }
        else if (type === "edge") {
          this.selected = { type, id };
          this._applySelectionUI(null, id);
        }
    }

    // -------------------- BINDING NODES & EDGES (DOM <-> DATA) --------------------
    _bindEdgesAndNodes(forceFull = false) {
      // Create maps to translate between map model and simulation nodes/edges
      const nodeById = new Map();
      (this.map.nodes || []).forEach(n => { nodeById.set(n.nodeId, n); });

      const allNodes = this.map.nodes || [];

      // Reuse existing simulation nodes where possible to keep velocities/fx/fy
      const existingSimNodes = new Map((this.simulation.nodes() || []).map(n => [n.nodeId, n]));

      const simNodes = allNodes.map(mapNode => {
        const existing = existingSimNodes.get(mapNode.nodeId);
        const hasLocalStamp = typeof mapNode.lastLocalUpdate === "number" && (Date.now() - mapNode.lastLocalUpdate) < this._localUpdateTTL;

        // Determine coordinates: prefer mapNode.x/y if present AND either it's local recent or source of truth
        const xPrior = (typeof mapNode.x === "number") ? mapNode.x : null;
        const yPrior = (typeof mapNode.y === "number") ? mapNode.y : null;

        let sn;
        if (existing) {
          // reuse object but update map backref and coordinates if map has a recent local stamp or defined coords
          sn = existing;
          sn.__mapNode = mapNode;
          if (xPrior !== null && yPrior !== null) {
            // prefer local/time-authoritative coords
            sn.x = xPrior; sn.y = yPrior;
            if (mapNode.locked === true) { sn.fx = xPrior; sn.fy = yPrior; }
            else if (hasLocalStamp) { sn.fx = null; sn.fy = null; } // unlocked local update
          } else {
            // if no coords, keep existing sim coords
            if (mapNode.locked === true) {
              sn.fx = (typeof mapNode.x === "number" ? mapNode.x : sn.x);
              sn.fy = (typeof mapNode.y === "number" ? mapNode.y : sn.y);
              sn.x = sn.fx; sn.y = sn.fy;
            }
          }
        } else {
          // no existing sim node — create a fresh one
          const sx = (xPrior !== null) ? xPrior : (window.innerWidth / 2 + 2 * Math.random() * 200);
          const sy = (yPrior !== null) ? yPrior : (window.innerHeight / 2 + 2 * Math.random() * 200);
          sn = {
            nodeId: mapNode.nodeId,
            x: sx,
            y: sy,
            __mapNode: mapNode
          };
          if (mapNode.locked === true) {
            sn.fx = (typeof mapNode.x === "number" ? mapNode.x : sn.x);
            sn.fy = (typeof mapNode.y === "number" ? mapNode.y : sn.y);
            sn.x = sn.fx; sn.y = sn.fy;
          }
        }

        return sn;
      });

      // Build simEdges aligned with existing nodes
      const simEdges = (this.map.edges || [])
        .filter(e => nodeById.has(e.source) && nodeById.has(e.target))
        .map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || "direct",
          __mapEdge: e
        }));

      // Apply to simulation (this also sets up link force)
      this.simulation.nodes(simNodes);
      this.simulation.force("link").links(simEdges);

      // Back-link simulation node to its container for drag behavior referencing
      simNodes.forEach(n => { n.__mapNode.__d3node = n; });

      // ----------- EDGES BIND -----------
      const edgesSel = this.edgesG.selectAll("g.edge-group").data(simEdges, d => d.id);

      const eEnter = edgesSel.enter()
        .append("g")
        .attr("class", "edge-group")
        .attr("data-edge-id", d => d.id);

      // visible line
      eEnter.append("line")
        .attr("class", "edge-line")
        .attr("stroke-width", 1)
        .style("pointer-events", "stroke")
        .style("fill", "none");

      // invisible thicker hit area for easier clicks
      eEnter.append("line")
        .attr("class", "edge-hit")
        .attr("stroke-width", 12)
        .style("stroke", "transparent")
        .style("cursor", "pointer")
        .style("pointer-events", "stroke");

      // click on the invisible hit line selects the edge
      this.edgesG.selectAll("g.edge-group").selectAll(".edge-hit")
        .on("click", (event, d) => {
          event.stopPropagation();
          this._setSelected({type: "edge", id: d.id});
          // Cancel pending connections
          if (this._pendingConnectionFrom) this._cancelPendingConnection();
        });

      edgesSel.exit().remove();

      // Update edge visuals (dash for related, arrow for direct, color selection)
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const gEl = d3.select(nodes[i]);
        const line = gEl.select(".edge-line");
        if (d.type === "related") line.style("stroke-dasharray", "6,6");
        else line.style("stroke-dasharray", null);
        if (d.type === "direct") line.attr("marker-end", "url(#arrow)");
        else line.attr("marker-end", null);
        if (this.selected && this.selected.type === "edge" && this.selected.id === d.id) {
          line.style("stroke", this.palette[this.currentTheme].edge.strokeSelected);
        } else {
          line.style("stroke", this.palette[this.currentTheme].edge.stroke);
        }
      });

      // ----------- NODES BIND -----------
      const nodesSel = this.nodesG.selectAll("g.node-group").data(simNodes, d => d.nodeId);

      // Enter: build node group with drag behavior and inner rect/text
      const nodeEnter = nodesSel.enter()
        .append("g")
        .attr("class", "node-group")
        .attr("data-node-id", d => d.nodeId)
        .call(d3.drag()
          .on("start", (event, d) => {
            const mapNode = d.__mapNode;
            d.startX = d.x; d.startY = d.y;
            d.fx = d.x; d.fy = d.y;
            this.selected = { type: "node", id: d.nodeId };
            try { this.svg.style("cursor", "grabbing"); } catch (e) {}
          })
          .on("drag", (event, d) => {
            const mapNode = d.__mapNode;
            // Elastic drag forces
            this._enableDragForces(mapNode && mapNode.locked === true ? d.nodeId : null);
            // Convert pointer to coordinates inside root group
            const [nx, ny] = d3.pointer(event, this.g.node());
            d.fx = nx; d.fy = ny; d.x = nx; d.y = ny;
            if (event.subject && event.subject.__containerNode) {
              // Quick visual update to inner container for immediate feedback during drag
              d3.select(event.subject.__containerNode).attr("transform", `translate(${d.x - this.nodeWidth / 2}, ${d.y - this.nodeHeight / 2})`);
            }
            // Update positions of nodes/edges while dragging
            this._tickUpdatePositions();
            // Force redraw of connected edges during drag
            this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
              const g = d3.select(nodes[i]);
              g.select(".edge-line")
                .attr("x1", d.source.x).attr("y1", d.source.y)
                .attr("x2", d.target.x).attr("y2", d.target.y);
              g.select(".edge-hit")
                .attr("x1", d.source.x).attr("y1", d.source.y)
                .attr("x2", d.target.x).attr("y2", d.target.y);
            });
          })
          .on("end", (event, d) => {
            const mapNode = d.__mapNode;
            const margin = this.nodeMargin || 0;
            const grid = this.gridSpacing;

            let snappedX = Math.round(d.x / grid) * grid;
            let snappedY = Math.round(d.y / grid) * grid;
            if (Math.abs(snappedX - d.x) <= margin) snappedX = d.x;
            if (Math.abs(snappedY - d.y) <= margin) snappedY = d.y;

            d.x = snappedX; d.y = snappedY; d.fx = snappedX; d.fy = snappedY; d.vx = 0; d.vy = 0;

            if (mapNode) {
              // Snap to grid
              const minMove = Math.ceil(this.gridSpacing / 2);
              const moved = Math.abs(snappedX - d.startX) > minMove || Math.abs(snappedY - d.startY) > minMove;
              if (moved) {
                mapNode.x = Math.round(d.x / 5) * 5;
                mapNode.y = Math.round(d.y / 5) * 5;
                mapNode.locked = true;
                this._updateNodePosition(mapNode.nodeId, mapNode.x, mapNode.y, mapNode.locked);
              }
              this._setSelected({type: "node", id: mapNode.nodeId});
            }
            this.simulation.alpha(0.2).restart();

            setTimeout(() => {
              const simNodes = this.simulation.nodes() || [];
              simNodes.forEach(n => {
                const mapNode2 = n.__mapNode;
                // Snap to grid
                if (mapNode2 && !mapNode2.locked) {
                  // Snap to grid
                  n.x = Math.round(n.x / grid) * grid;
                  n.y = Math.round(n.y / grid) * grid;
                  // Keep nodes unlocked, reset velocity
                  n.fx = null; n.fy = null; n.vx = 0; n.vy = 0;
                  // Update positions
                  mapNode2.x = n.x;
                  mapNode2.y = n.y;
                  mapNode2.locked = false;
                }
              });
              this.updateMap();
            }, 1000);
            this._disableDragForces();
            try { this.svg.style("cursor", "grab"); } catch (e) {}
          })
        );

      // Save DOM container reference on each entered node for quick updates
      nodeEnter.each((d, i, nodes) => { d.__containerNode = nodes[i]; });

      // Selection rectangle (shown when node is selected)
      nodeEnter.append("rect")
        .attr("class", "selection-rect")
        .attr("rx", d => d.__mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius)
        .attr("ry", d => d.__mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius)
        .style("fill", "none")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .style("pointer-events", "none")
        .style("display", "none");

      // Main node rectangle (fill + stroke)
      nodeEnter.append("rect")
        .attr("class", "selected-node")
        .attr("rx", this.nodeBorderRadius)
        .attr("ry", this.nodeBorderRadius)
        .style("stroke-width", 1)
        .style("cursor", "pointer");

      // Node topic
      nodeEnter.append("text")
        .attr("class", "node-topic")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .style("font-family", "Roboto, sans-serif")
        .style("pointer-events", "none")
        .style("user-select", "none")
        .style("font-size", "0.9rem");

      // Node content (only shown when maximized)
      nodeEnter.append("text")
        .attr("class", "node-content")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .style("font-family", "Roboto, sans-serif")
        .style("pointer-events", "none")
        .style("user-select", "none")
        .style("font-size", "0.7rem")
        .style("display", "none");

      // Check mark (approved)
      nodeEnter.append("text")
        .attr("class", "node-approved")
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging")
        .style("font-weight", "500")
        .style("font-size", "0.5rem")
        .style("user-select", "none")
        .style("display", "none")
        .text("\u2713");

      // Clicking a node selects it or completes a pending connection
      this.nodesG.selectAll("g.node-group")
        .on("click", (event, d) => {
          event.stopPropagation();
          const mapNode = d.__mapNode;
          if (this._pendingConnectionFrom) {
            // If user previously started a connection, create it now
            const nodeIdFrom = this._pendingConnectionFrom;
            const nodeIdTo = mapNode.nodeId;
            this.setConnection(nodeIdFrom, nodeIdTo, "direct");
            this._pendingConnectionFrom = null;
            this._setSelected({type: "node", id: nodeIdFrom});
            // End link command
            endLinkCommand({nodeIdFrom, nodeIdTo});
            return;
          }
        });

      // Keep container refs up-to-date (useful for later operations)
      const allNodeGroups = this.nodesG.selectAll("g.node-group");
      allNodeGroups.each((d, i, nodes) => { d.__containerNode = nodes[i]; });

      // Update visuals (fill, stroke, size, topic, content, check mark) for every node group
      allNodeGroups.each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;

        // Determine width/height based on hidden/maximized/default
        let w, h;
        if (mapNode.hidden) { w = this.hiddenNodeWidth; h = this.hiddenNodeHeight;
        } else if (mapNode.maximized) { w = this.nodeWidthMax; h = this.nodeHeightMax;
        } else { w = this.nodeWidth; h = this.nodeHeight;
        }

        const borderRadius = mapNode.hidden ? this.hiddenNodeBorderRadius : this.nodeBorderRadius;
        const scheme = this._getSchemeByName(mapNode.colorSchemeName) || null;
        const fill = scheme ? scheme.fill : this.palette[this.currentTheme].node.fill;
        const stroke = scheme ? scheme.stroke : this.palette[this.currentTheme].node.stroke;
        const strokeSelected = scheme ? scheme.strokeSelected : this.palette[this.currentTheme].node.selected;
        const textColor = scheme ? scheme.text : this.palette[this.currentTheme].node.text;

        // Update main rect
        g.select(".selected-node")
          .attr("width", w)
          .attr("height", h)
          .attr("rx", borderRadius)
          .attr("ry", borderRadius)
          .style("fill", fill)
          .style("stroke", (this.selected && this.selected.type === "node" && this.selected.id === mapNode.nodeId) ? strokeSelected : stroke);

        // Update selection rect to match size + small padding
        const pad = 3;
        const selWidth = w + pad * 2;
        const selHeight = h + pad * 2;
        g.select(".selection-rect")
          .attr("x", -pad)
          .attr("y", -pad)
          .attr("width", selWidth)
          .attr("height", selHeight)
          .attr("rx", borderRadius)
          .attr("ry", borderRadius)
          .style("fill", this.palette[this.currentTheme].node.selected)
          .style("display", (this.selected && this.selected.type === "node" && this.selected.id === mapNode.nodeId) ? null : "none");

        // Text handling:
        // Topic is always present unless hidden - same font size across states
        // content is only shown when maximized; multiple lines supported via newline -> tspans
        const topicText = mapNode.hidden ? "+" : (mapNode.topic || "");
        const topicEl = g.select(".node-topic")
          .attr("x", w / 2)
          .attr("y", (mapNode.hidden ? (h / 2 - 12) : 12)) // center for hidden; top margin for others
          .style("fill", textColor)
          .style("display", mapNode.hidden ? null : null) // topic shows in all states (hidden uses "+")
          .text(topicText);

        // Content element: show only when maximized (and not hidden)
        const contentEl = g.select(".node-content");
        if (mapNode.maximized && !mapNode.hidden) {
          // Show content and wrap by newline if necessary
          contentEl.style("display", null)
            .style("fill", textColor);

          // clear old tspans and set new ones based on content lines
          contentEl.selectAll("tspan").remove();
          const lines = (mapNode.content || "").split(/\r?\n/).slice(0, 8); // limit lines
          // Position content below the topic
          const topPadding = 12; // spacing from top
          const topicHeight = 18; // approx topic height
          const startY = topicHeight + topPadding;
          lines.forEach((ln, idx) => {
            contentEl.append("tspan")
              .attr("x", w / 2)
              .attr("dy", idx === 0 ? `${startY}px` : "1.1em")
              .text(ln);
          });
        } else {
          // Hide content when not maximized
          contentEl.style("display", "none").selectAll("tspan").remove();
        }

        // Approved check rendering
        const approvedEl = g.select(".node-approved");
        if (!mapNode.hidden) {
          const scheme = this._getSchemeByName(mapNode.colorSchemeName);
          approvedEl
            .attr("x", w - 6)
            .attr("y", h - 12)
            .style("display", null)
            .style("fill", mapNode.approved ? scheme.text : scheme.stroke);
        } else {
          approvedEl.style("display", "none");
        }

        // For hidden nodes, we want the '+' centered vertically; adjust topic y accordingly above
        if (mapNode.hidden) {
          g.select(".node-topic").attr("y", h / 2 - 6).attr("dominant-baseline", "central");
        } else {
          // For non-hidden nodes, set topic baseline to hanging (near top)
          g.select(".node-topic").attr("dominant-baseline", "hanging");
        }

        // Position group according to simulation coordinates (centered on node width/height)
        g.attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
      });

      // Remove exiting nodes
      nodesSel.exit().remove();

      // ----------------- SIMULATION TICK -----------------
      // Update DOM positions on tick
      this.simulation.on("tick.updateDOM", () => {
        this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
          const mapNode = d.__mapNode;
          const w = mapNode.hidden ? this.hiddenNodeWidth : (mapNode.maximized ? this.nodeWidthMax : this.nodeWidth);
          const h = mapNode.hidden ? this.hiddenNodeHeight : (mapNode.maximized ? this.nodeHeightMax : this.nodeHeight);
          d3.select(nodes[i]).attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
        });

        this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
          const g = d3.select(nodes[i]);
          const line = g.select(".edge-line");
          line.attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
          g.select(".edge-hit").attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
        });
      });

      // Ensure simulation restarts with new nodes/edges
      this.simulation.alpha(0.8).restart();
      this._paintSelection();
    }

    // Quick DOM update used while dragging
    _tickUpdatePositions() {
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const mapNode = d.__mapNode;
        const w = mapNode.hidden ? this.hiddenNodeWidth : (mapNode.maximized ? this.nodeWidthMax : this.nodeWidth);
        const h = mapNode.hidden ? this.hiddenNodeHeight : (mapNode.maximized ? this.nodeHeightMax : this.nodeHeight);
        d3.select(nodes[i]).attr("transform", `translate(${d.x - w / 2}, ${d.y - h / 2})`);
      });
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const line = g.select(".edge-line");
        line.attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
        g.select(".edge-hit").attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", d.target.x).attr("y2", d.target.y);
      });
    }

    // -------------------- UTILITIES & NORMALIZATION --------------------
    _normalizeNode(n) {
      // Ensure node has expected properties and normalized defaults
      return {
        nodeId: String(n.nodeId),
        parentId: n.parentId || n.parent || null,
        topic: n.topic || "",
        content: n.content || "",
        detail: n.detail || "",
        x: typeof n.x === "number" ? n.x : null,
        y: typeof n.y === "number" ? n.y : null,
        locked: !!n.locked,
        approved: !!n.approved,
        maximized: !!n.maximized,
        hidden: !!n.hidden,
        colorSchemeName: n.colorSchemeName || "ocean",
      };
    }

    _normalizeEdge(e) {
      // Ensure edge has id, source, target and proper type
      return {
        id: e.id || `edge-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: e.type === "related" ? "related" : "direct"
      };
    }

    // Re-run physics to improved layout then lock nodes in place
    _rebuildMap() {
      // Enable forces then release unlocked nodes to be repositioned
      this._enableDragForces();

      const simNodes = this.simulation.nodes() || [];
      simNodes.forEach(n => {
        const mapNode = n.__mapNode;
        if (mapNode && !mapNode.locked) {
          n.fx = null; n.fy = null;
        } else if (mapNode && mapNode.locked) {
          // pinned nodes remain fixed
          n.fx = (typeof mapNode.x === "number" ? mapNode.x : n.x);
          n.fy = (typeof mapNode.y === "number" ? mapNode.y : n.y);
          n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0;
        }
      });

      this.simulation.alpha(0.8).restart();

      // After a delay, snap positions to grid
      setTimeout(() => {
        simNodes.forEach(n => {
          const mapNode = n.__mapNode;
          if (mapNode && !mapNode.locked) {
            const grid = this.gridSpacing;
            const snappedX = Math.round(n.x / grid) * grid;
            const snappedY = Math.round(n.y / grid) * grid;
            n.x = snappedX; n.y = snappedY; n.fx = snappedX; n.fy = snappedY; n.vx = 0; n.vy = 0;
            mapNode.x = snappedX; mapNode.y = snappedY; mapNode.locked = true;
          }
        });
        this._disableDragForces();
        this.updateMap(true);
      }, 2000);
    }

    // -------------------- SELECTION & STYLING --------------------
    _paintSelection() {
      // Update edge colors based on selection
      this.edgesG.selectAll("g.edge-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const line = g.select(".edge-line");
        if (this.selected && this.selected.type === "edge" && this.selected.id === d.id) line.style("stroke", this.palette[this.currentTheme].edge.strokeSelected);
        else line.style("stroke", this.palette[this.currentTheme].edge.stroke);
      });

      // Update node strokes and selection rects
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;
        const scheme = this._getSchemeByName(mapNode.colorSchemeName) || null;
        const stroke = scheme ? scheme.stroke : this.palette[this.currentTheme].node.stroke;
        const strokeSelected = scheme ? scheme.strokeSelected : this.palette[this.currentTheme].node.selected;
        const isSelected = (this.selected && this.selected.type === "node" && this.selected.id === mapNode.nodeId);
        g.select(".selected-node").style("stroke", isSelected ? strokeSelected : stroke);
        g.select(".selection-rect").style("display", isSelected ? null : "none");
      });
    }

    // Get color scheme by name
    _getSchemeByName(name) {
      return this.colorSchemes.find(s => s.name === name) || null;
    }

    _updateNodeStrokes() {
      // Called to recompute node stroke styles across nodes
      this.nodesG.selectAll("g.node-group").each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        const mapNode = d.__mapNode;
        const scheme = this._getSchemeByName(mapNode.colorSchemeName) || this._getSchemeByName(this.currentColorSchemeName);
        const stroke = (scheme && scheme.stroke) || this.palette[this.currentTheme].node.stroke;
        const strokeSelected = this._getSelectedNodeStroke(mapNode.nodeId);
        const isSelected = (this.selected.type === "node" && this.selected.id === mapNode.nodeId);
        g.select(".selected-node").style("stroke", isSelected ? strokeSelected : stroke);
        g.select(".selection-rect").style("display", isSelected ? null : "none");
      });
    }

    _getSelectedNodeStroke(nodeId) {
      // Return the stroke color to use when this node is selected
      const node = (this.map.nodes || []).find(n => n.nodeId === nodeId);
      if (!node) return this.palette[this.currentTheme].edge.strokeSelected;
      const scheme = this._getSchemeByName(mapNode.colorSchemeName);
      if (scheme && scheme.strokeSelected) return scheme.strokeSelected;
      return this.palette[this.currentTheme].edge.strokeSelected;
    }

    _startConnectionFromSelected() {
      // Mark pending connection start from currently selected node
      if (!this.selected || this.selected.type !== "node") return;
      this._pendingConnectionFrom = this.selected.id;
      // Change cursor to indicate connection in progress
      this.svg.style("cursor", "crosshair");
    }

    _cancelPendingConnection() {
      // Clear pending connection state
      this._pendingConnectionFrom = null;
      // End link command
      endLinkCommand({nodeIdFrom: null, nodeIdTo: null});
    }

    // -------------------- RESIZE, ZOOM & FIT --------------------
    _onResize() {
      // Recompute grid and restart small simulation nudge
      this._updateDotGrid();
      this.simulation.alpha(0.2).restart();
    }

    zoomBy(factor = 1.2) {
      // Zoom in/out relative
      if (!this.svg || !this.zoom) return;
      this.svg.transition().duration(200).call(this.zoom.scaleBy, factor);
    }

    zoomFit(padding = 100) {
      // Fit viewport to all nodes with given padding
      if (!this.svg || !this.zoom) return;
      const simNodes = (this.simulation && typeof this.simulation.nodes === "function") ? this.simulation.nodes() : [];
      if (!simNodes || simNodes.length === 0) return;
      const svgRect = this.svg.node().getBoundingClientRect();
      let sidebarWidth = 0;
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !(sidebar.classList && sidebar.classList.contains("collapsed"))) {
        sidebarWidth = sidebar.offsetWidth || 0;
      }
      const visibleWidth  = Math.max(1, svgRect.width  - sidebarWidth);
      const visibleHeight = Math.max(1, svgRect.height);
      const pad = Math.max(0, padding);
      const innerW = Math.max(1, visibleWidth  - 2 * pad);
      const innerH = Math.max(1, visibleHeight - 2 * pad);

      let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity;
      for (const n of simNodes) {
        const mapNode = n.__mapNode || {};
        const w = mapNode.hidden ? this.hiddenNodeWidth  : this.nodeWidth;
        const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;
        const x = (typeof n.x === "number") ? n.x : 0;
        const y = (typeof n.y === "number") ? n.y : 0;
        const left   = x - w / 2;
        const right  = x + w / 2;
        const top    = y - h / 2;
        const bottom = y + h / 2;
        if (left   < minX) minX = left;
        if (right  > maxX) maxX = right;
        if (top    < minY) minY = top;
        if (bottom > maxY) maxY = bottom;
      }

      let contentW = maxX - minX;
      let contentH = maxY - minY;
      if (!(contentW > 0)) contentW = 1;
      if (!(contentH > 0)) contentH = 1;

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      const scaleX = innerW / contentW;
      const scaleY = innerH / contentH;
      let k = Math.min(scaleX, scaleY);

      const extent = (typeof this.zoom.scaleExtent === "function") ? this.zoom.scaleExtent() : [0.2, 5];
      const kMin = Array.isArray(extent) ? extent[0] : 0.2;
      const kMax = Array.isArray(extent) ? extent[1] : 5;
      k = Math.max(kMin, Math.min(k, kMax));

      const px = sidebarWidth + visibleWidth / 2;
      const py = visibleHeight / 2;

      const tx = px - k * cx;
      const ty = py - k * cy;

      const transform = d3.zoomIdentity.translate(tx, ty).scale(k);

      this.svg.transition()
        .duration(250)
        .call(this.zoom.transform, transform);
    }

    // -------------------- CONVERSION HELPERS: backend <-> canvas --------------------
    _convertMapToCanvas(backendMap) {
      // Normalize backend payload to canvas internal schema
      if (!backendMap || typeof backendMap !== "object") return { nodes: [], edges: [] };

      // If already canvas-like, keep more or less intact (but normalize nodes/edges)
      const nodesField = Array.isArray(backendMap.nodes) ? backendMap.nodes : [];
      const firstNode = nodesField.length > 0 ? nodesField[0] : null;
      const looksCanvas = firstNode && firstNode.hasOwnProperty("id") && !firstNode.hasOwnProperty("nodeId");

      if (looksCanvas) {
        this.backendMeta = {
          projectId: backendMap.projectId || null,
          owner: backendMap.owner || null,
          colabs: Array.isArray(backendMap.colabs) ? backendMap.colabs : [],
          userPrompt: backendMap.userPrompt || "",
          title: backendMap.title || "",
          creationStatus: backendMap.creationStatus || "created"
        };
        const nodes = nodesField.map(n => this._normalizeNode(n));
        const edges = (Array.isArray(backendMap.edges) ? backendMap.edges : []).map(e => this._normalizeEdge(e));
        return {
          projectId: backendMap.projectId || null,
          owner: backendMap.owner || null,
          colabs: Array.isArray(backendMap.colabs) ? backendMap.colabs : [],
          userPrompt: backendMap.userPrompt || "",
          title: backendMap.title || "",
          creationStatus: backendMap.creationStatus || "created",
          lastUpdated: backendMap.lastUpdated || new Date(Date.now()),
          nodes,
          edges
        };
      }

      // Otherwise treat as older backend schema (nodeId / directLink / relatedLink)
      this.backendMeta = {
        projectId: backendMap.projectId || null,
        owner: backendMap.owner || null,
        colabs: Array.isArray(backendMap.colabs) ? backendMap.colabs : [],
        userPrompt: backendMap.userPrompt || "",
        title: backendMap.title || "",
        creationStatus: backendMap.creationStatus || "created"
      };

      const nodes = [];
      const edges = [];

      if (Array.isArray(backendMap.nodes)) {
        backendMap.nodes.forEach((n, idx) => {
          const nodeId = n.nodeId || `node_${Date.now()}_${idx}`;
          const parentId = n.parentId || null;
          const topic = n.topic || "";
          const content = n.content || "";
          const detail = n.detail || "";
          const status = n.status || null;
          const x = typeof n.x === "number" ? n.x : null;
          const y = typeof n.y === "number" ? n.y : null;
          const locked = !!n.locked;
          const approved = !!n.approved;
          const maximized = !!n.maximized;
          const hidden = !!n.hidden;
          const colorSchemeName = n.colorSchemeName || this.currentColorSchemeName;

          nodes.push(this._normalizeNode({
            nodeId,
            parentId,
            topic,
            content,
            detail,
            status,
            x,
            y,
            locked,
            approved,
            maximized,
            hidden,
            colorSchemeName,
          }));

          // If no coordinates at all, center the first node
          if (nodes.length > 0) {
            const hasAnyXY = nodes.some(n => typeof n.x === "number" && typeof n.y === "number");
            if (!hasAnyXY) {
              nodes[0].x = window.innerWidth / 2;
              nodes[0].y = window.innerHeight / 2;
              nodes[0].locked = true;
            }
          }

          // Convert directLink arrays to edges
          if (Array.isArray(n.directLink)) {
            n.directLink.forEach(targetId => {
              if (targetId) {
                if (edges.find(e => e.source === targetId && e.target === nodeId)) return;
                edges.push(this._normalizeEdge({
                  id: `edge-${nodeId}-${targetId}`,
                  source: nodeId,
                  target: targetId,
                  type: "direct"
                }));
              }
            });
          }

          // Convert relatedLink arrays to edges
          if (Array.isArray(n.relatedLink)) {
            n.relatedLink.forEach(targetId => {
              if (targetId) {
                if (edges.find(e => e.source === targetId && e.target === nodeId)) return;
                edges.push(this._normalizeEdge({
                  id: `edge-${nodeId}-${targetId}-related`,
                  source: nodeId,
                  target: targetId,
                  type: "related"
                }));
              }
            });
          }
        });
      }

      return {
        projectId: this.backendMeta.projectId,
        owner: this.backendMeta.owner,
        colabs: this.backendMeta.colabs,
        userPrompt: this.backendMeta.userPrompt,
        title: this.backendMeta.title,
        creationStatus: this.backendMeta.creationStatus,
        lastUpdated: backendMap.lastUpdated || new Date(Date.now()),
        nodes,
        edges
      };
    }

    _convertMapToBackend() {
      // Convert canvas schema to backend schema for host consumption
      // Direct and related links
      const directLinks = {};
      const relatedLinks = {};
      (this.map.edges || []).forEach(e => {
        if (!e.source || !e.target) return;
        if (e.type === "direct") {
          if (!directLinks[e.source]) directLinks[e.source] = [];
          directLinks[e.source].push(e.target);
          if (!directLinks[e.target]) directLinks[e.target] = [];
          directLinks[e.target].push(e.source);
        } else {
          if (!relatedLinks[e.source]) relatedLinks[e.source] = [];
          relatedLinks[e.source].push(e.target);
          if (!relatedLinks[e.target]) relatedLinks[e.target] = [];
          relatedLinks[e.target].push(e.source);
        }
      });

      const nodes = (this.map.nodes || []).map(n => {
        return {
          nodeId: n.nodeId,
          topic: n.topic || "",
          content: n.content || "",
          detail: n.detail || "",
          directLink: directLinks[n.nodeId] || [],
          relatedLink: relatedLinks[n.nodeId] || [],
          x: typeof n.x === "number" ? n.x : null,
          y: typeof n.y === "number" ? n.y : null,
          locked: !!n.locked,
          approved: !!n.approved,
          maximized: !!n.maximized,
          hidden: !!n.hidden,
          colorSchemeName: n.colorSchemeName || this.currentColorSchemeName
        };
      });

      return {
        projectId: this.backendMeta?.projectId || this.map.projectId || null,
        owner: this.backendMeta?.owner || this.map.owner || null,
        colabs: Array.isArray(this.backendMeta?.colabs) ? this.backendMeta.colabs : (Array.isArray(this.map.colabs) ? this.map.colabs : []),
        userPrompt: this.map.userPrompt || "",
        creationStatus: this.map.creationStatus || null,
        title: this.map.title || "",
        lastUpdated: new Date(Date.now()),
        selectedNode: this.map.selectedNode || null,
        nodes
      };
    }

    // -------------------- NODE / EDGE MUTATIONS (internal helpers) --------------------
    // These helpers are used by the public API below. They preserve internal invariants
    // such as normalizing nodes/edges and calling updateMap as appropriate.

    // Add temp node
    _addTempNode({parentId, topic = 'New node'}) {
      if (!parentId) return;
      // Create new node
      const node = this._createNode({parentId, topic});
      this.updateMap();
      return node.nodeId;
    }

    // Add node
    _addNodeInternal({ parentId, nodeId, topic = "", content = "", detail = "", x = null, y = null, locked = false, approved = false, maximized = false, hidden = false, colorSchemeName = this.currentColorSchemeName } = {}) {
      if (!parentId) return;
      // Create node
      const node = this._createNode({ parentId, nodeId, topic, content, detail, x, y, locked, approved, maximized, hidden, colorSchemeName });
      this.updateMap();
      return node.nodeId;
    }

    // Create new node
    _createNode ({ parentId, nodeId, topic = "", content = "", detail = "", x = null, y = null, locked = false, approved = false, maximized = false, hidden = false, colorSchemeName = this.currentColorSchemeName } = {}) {
      if (!parentId) return;
      // Create node id
      if (!nodeId) nodeId = `temp_${Date.now()}_${Math.floor(Math.random() * 99)}`;
      // Position node
      if (this.map.nodes.length === 0) {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      } else {
        const parentNode = this.map.nodes.find(n => n.nodeId === parentId);
        const parentX = parentNode ? parentNode.x : window.innerWidth / 2;
        const parentY = parentNode ? parentNode.y : window.innerHeight / 2;
        x = Math.round(parentX + 2 * Math.random() * this.nodeWidth);
        y = Math.round(parentY + 2 * Math.random() * this.nodeHeight);
      }
      // Lock node if first node
      locked = false;
      if (this.map.nodes.length === 0) locked = true;
      // Set color scheme
      if (!colorSchemeName) colorSchemeName = this.currentColorSchemeName;
      const parentNode = this.map.nodes.find(n => n.nodeId === parentId);
      if (parentNode && parentNode.colorSchemeName) colorSchemeName = parentNode.colorSchemeName;
      // Create node
      const node = {
        nodeId,
        parentId,
        topic,
        content,
        detail,
        x,
        y,
        locked,
        approved: approved,
        maximized: maximized,
        hidden: hidden,
        colorSchemeName: colorSchemeName
      };
      // Add node to map
      this.map.nodes.push(this._normalizeNode(node));
      // Set connection
      if (parentId !== 1) {
        this.setConnection(parentId, nodeId, "direct");
        this.setConnection(nodeId, parentId, "direct");
      }
      return node;
    }

    // Update node nodeId position at x, y and lock ?
    async _updateNodePosition(nodeId, x, y, locked = false) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      // Pin node
      node.x = x;
      node.y = y;
      node.locked = locked;
      if (locked === true) await requestPinNode(nodeId);
    }

    // Cleans up event listeners and resources
    destroy() {
      window.removeEventListener("resize", this._onResizeBound);
      if (this.svg) {
        this.svg.on("click", null);
        this.svg.on(".zoom", null);
      }
      if (this.simulation) this.simulation.stop();
    }

    // -------------------- EXPORT PNG PREP (host on frontend) --------------------
    _prepareExportPng() {
        // Get simulation nodes
        const simNodes = this.simulation.nodes() || [];
        // Prevent exporting empty map
        if (simNodes.length === 0) return null;

        // Compute full bounds (include negative coords, all nodes even hidden)
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        simNodes.forEach(n => {
            const mapNode = n.__mapNode;
            if (!mapNode) return;
            const w = mapNode.hidden ? this.hiddenNodeWidth : this.nodeWidth;
            const h = mapNode.hidden ? this.hiddenNodeHeight : this.nodeHeight;
            const left = n.x - w / 2;
            const right = n.x + w / 2;
            const top = n.y - h / 2;
            const bottom = n.y + h / 2;
            // Set bounds
            minX = Math.min(minX, left);
            maxX = Math.max(maxX, right);
            minY = Math.min(minY, top);
            maxY = Math.max(maxY, bottom);
        });

        // Add padding (gridSpacing for margin around map)
        const padding = this.gridSpacing;
        const width = maxX - minX + 2 * padding;
        const height = maxY - minY + 2 * padding;
        const viewMinX = minX - padding;
        const viewMinY = minY - padding;

        // Clone SVG for export
        const tempSvg = this.svg.node().cloneNode(true);

        // Set viewBox to full bounds (handles negatives)
        tempSvg.setAttribute('viewBox', `${viewMinX} ${viewMinY} ${width} ${height}`);

        // Reset root-g transform to show absolute/full positions (ignore current zoom/pan)
        const rootG = tempSvg.querySelector('.root-g');
        if (rootG) { rootG.setAttribute('transform', ''); }

        // Hide grid
        const gridG = tempSvg.querySelector('.dot-grid');
        if (gridG) { gridG.style.display = 'none'; }

        // Hide selection highlights
        tempSvg.querySelectorAll('.selection-rect').forEach(el => { el.style.display = 'none'; });

        // Style

        // Serialize
        const svgString = new XMLSerializer().serializeToString(tempSvg);

        return {
          svgString,
          bounds: { minX: viewMinX, minY: viewMinY, width, height }
        };
    }

    // -------------------- PUBLIC API --------------------

    //setMap(map) - Auto-detects backend vs canvas and normalizes to internal canvas schema.
    setMap(map) {
      if (!map) return;
      const looksLikeBackend = Array.isArray(map.nodes) && map.nodes.length > 0 && (map.nodes[0].hasOwnProperty("nodeId") || map.hasOwnProperty("projectId"));
      if (looksLikeBackend) {
        // Convert from backend
        this.map = this._convertMapToCanvas(map);
      } else {
        // Assume canvas-friendly; shallow copy + normalize arrays
        this.map = {
          projectId: map.projectId || this.map.projectId || null,
          owner: map.owner || this.map.owner || null,
          colabs: Array.isArray(map.colabs) ? map.colabs : (this.map.colabs || []),
          userPrompt: map.userPrompt || this.map.userPrompt || "",
          creationStatus: map.creationStatus || this.map.creationStatus || "created",
          title: map.title || this.map.title || "",
          lastUpdated: map.lastUpdated || new Date(Date.now()),
          selectedNode: map.selectedNode || null,
          nodes: Array.isArray(map.nodes) ? map.nodes.map(n => this._normalizeNode(n)) : [],
          edges: Array.isArray(map.edges) ? map.edges.map(e => this._normalizeEdge(e)) : []
        };
      }

      // Keep backendMeta if provided
      this.backendMeta = {
        projectId: this.map.projectId || null,
        owner: this.map.owner || null,
        colabs: Array.isArray(this.map.colabs) ? this.map.colabs : [],
        userPrompt: this.map.userPrompt || null,
        creationStatus: this.map.creationStatus || "created",
        title: this.map.title || null,
        lastUpdated: this.map.lastUpdated || new Date(Date.now()),
        selectedNode: this.map.selectedNode || null
      };

      // Re-render and notify host
      this.updateMap(true);
    }

    // Rebind nodes & edges and refresh visuals.
    updateMap(forceFull = false) {
      // Ensure arrays exist
      this.map.nodes = Array.isArray(this.map.nodes) ? this.map.nodes : [];
      this.map.edges = Array.isArray(this.map.edges) ? this.map.edges : [];
      // Bind and render
      this._bindEdgesAndNodes(forceFull);
      this.map.lastUpdated = new Date(Date.now());
    }

    // Trigger a physics/force-based rebuild and then snap nodes to grid.
    rebuildMap() {
      if (!this.simulation) return;
      this._rebuildMap();
    }

    // Get backend schema map
    getBackendMap() {
      return this._convertMapToBackend(this.map);
    }

    //Clear nodes and edges (keeps some meta).
    deleteMap() {
      this.map = { nodes: [], edges: [], title: this.map.title || "", colabs: this.map.colabs || [] };
      this.updateMap(true);
      this._setSelected({type: null, id: null});
    }

    // Creates a temporary new node linked to parentId
    addTempNode({ parentId = 1, topic = "New node" }) {
      // Delegate to internal helper but keep public name stable
      const newNodeId = this._addTempNode({ parentId, topic });
      return newNodeId;
    }

    // Creates a new node linked to parentId
    addNode({ parentId, nodeId, topic = "", content = "", detail = "", x = null, y = null, locked = false, approved = false, maximized = false, hidden = false, colorSchemeName = this.currentColorSchemeName } = {}) {
      // Delegate to internal helper but keep public name stable
      const newNodeId = this._addNodeInternal({ parentId, nodeId, topic, content, detail, x, y, locked, approved, maximized, hidden, colorSchemeName });
      return newNodeId;
    }

    // Updates the node info
    updateNodeInfo({ nodeId, newNodeId, topic, content, detail }) {
      if (!nodeId) return;
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      // Node info
      node.nodeId = newNodeId || node.nodeId;
      node.topic = topic || node.topic;
      node.content = content || node.content;
      node.detail = detail || node.detail;
      // Edge info
      this.map.edges.forEach(e => {
        if (e.source === nodeId) e.source = newNodeId || node.nodeId;
        if (e.target === nodeId) e.target = newNodeId || node.nodeId;
      });
      this.updateMap();
    }

    // Create an edge between two nodes
    setConnection(nodeFromId, nodeToId, type = "direct") {
      if (!nodeFromId || !nodeToId) return;
      const edgeId = `edge-${nodeFromId}-${nodeToId}`;
      if (this.map.edges.some(e => e.id === edgeId)) return;
      const edge = { id: edgeId, source: nodeFromId, target: nodeToId, type: type === "related" ? "related" : "direct" };
      this.map.edges.push(this._normalizeEdge(edge));
      this.updateMap();
    }

    // Remove edges both directions between two nodes
    disconnect(nodeFromId, nodeToId) {
      if (!nodeFromId || !nodeToId) return;
      const ids = new Set([`edge-${nodeFromId}-${nodeToId}`, `edge-${nodeToId}-${nodeFromId}`]);
      const before = this.map.edges.length;
      this.map.edges = (this.map.edges || []).filter(e => !ids.has(e.id));
      if (this.map.edges.length !== before) {
        this.updateMap();
      }
    }

    // Remove Edge
    removeEdge(edgeId) {
      if (!edgeId) return;
      const before = this.map.edges.length;
      this.map.edges = (this.map.edges || []).filter(e => e.id !== edgeId);
      if (this.map.edges.length !== before) {
        this.updateMap();
      }
    }

    // Set theme
    setTheme(themeName) {
      if (!this.palette[themeName]) return;
      this.currentTheme = themeName;
      console.log(`Setting theme to ${themeName}`);

      // Update arrow color
      const markerPath = this.svg.select("defs marker#arrow path");
      if (!markerPath.empty()) {
        markerPath.attr("fill", this.palette[this.currentTheme].edge.stroke);
      }

      // Update grid pattern color
      this.svg.select("#grid-pattern circle")
        .style("fill", this.palette[this.currentTheme].canvas.gridDot);

      this.updateMap(true);
    }


    // setColorScheme(nodeId, schemeName)
    setColorScheme(nodeId, schemeName) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      if (!this._getSchemeByName(schemeName)) schemeName = this.currentColorSchemeName;
      node.colorSchemeName = schemeName;
      this.currentColorSchemeName = schemeName;
      this.updateMap(true);
    }

    // Delete node
    deleteNode(nodeId) {
      if (!nodeId) return;
      const nodeExists = this.map.nodes.some(n => n.nodeId === nodeId);
      if (!nodeExists) { console.warn(`Node ${nodeId} not found`); return; }
      this.map.nodes = (this.map.nodes || []).filter(n => n.nodeId !== nodeId);
      this.map.edges = (this.map.edges || []).filter(e => e.source !== nodeId && e.target !== nodeId);
      this.updateMap(true);
      this._setSelected({type: null, id: null});
    }

    // Delete edge
    deleteEdge(edgeId) {
      if (!edgeId) return;
      this.map.edges = (this.map.edges || []).filter(e => e.id !== edgeId);
      this.updateMap(true);
      this._setSelected({type: null, id: null});
    }

    // Toggles the type of the edge between "direct" and "indirect"
    toggleEdgeType(edgeId) {
      if (!edgeId) return;
      const edge = this.map.edges.find(e => e.id === edgeId) || null;
      if (!edge) return;
      edge.type = edge.type === "direct" ? "related" : "direct";
      this.updateMap(true);
    }

    // SelectElement ({ nodeId, edgeId })
    selectElement({ nodeId = null, edgeId = null } = {}) {
      if (nodeId) this._setSelected({type: "node", id: nodeId});
      if (edgeId) this._setSelected({type: "edge", id: edgeId});
    }

    // Get current project id
    getProjectId() { return this.map.projectId; }

    // Get selected node id
    getSelectedNodeId() {
      return this.selected && this.selected.type === "node" ? this.selected.id : null;
    }

    // Get selected edge id
    getSelectedEdgeId() {
      return this.selected && this.selected.type === "edge" ? this.selected.id : null;
    }

    // Get node xy
    getNodeXY(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId) || null;
      return node ? { x: node.x, y: node.y } : null;
    }

    // Update meta
    updateMeta( { colabs = [], title = ""} = {}) {
      this.map.colabs = Array.isArray(colabs) ? colabs : this.map.colabs;
      this.map.title = title ? title : this.map.title;
      this.map.lastUpdated = new Date(Date.now());
    }

    // Lock node
    lockNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.locked = true;
      this.updateMap(true);
    }

    // Unlock node
    unlockNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.locked = false;
      this.updateMap(true);
    }

    // Approve node
    approveNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.approved = true;
      this.updateMap(true);
    }

    // Revoke node
    revokeNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.approved = false;
      this.updateMap(true);
    }

    // Maximize node
    maximizeNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.maximized = true;
      node.hidden = false;
      this.updateMap(true);
    }

    // Minimize node
    minimizeNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.maximized = false;
      node.hidden = false;
      this.updateMap(true);
    }

    // Hide node
    hideNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.hidden = true;
      this.updateMap(true);
    }

    // Unhide node
    unhideNode(nodeId) {
      const node = this.map.nodes.find(n => n.nodeId === nodeId);
      if (!node) return;
      node.hidden = false;
      this.updateMap(true);
    }

    // Start node connection
    startConnection() {
      this._startConnectionFromSelected();
    }

    // -------------------- END OF CLASS --------------------
  }

  // Expose class globally
  window.braintroop = braintroop;

  // Convenience auto-instantiation if '#canvas' exists (original behavior)
  try {
    if (document.querySelector("#canvas")) {
        window.braintroop = new braintroop("#canvas");
    }
  } catch (err) {
        console.error("braintroop error:", err);
  }

})();
