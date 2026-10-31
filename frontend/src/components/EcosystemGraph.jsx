import React, { useEffect, useRef, useState, useMemo } from "react";
import "./EcosystemGraph.css";
import {
  MOCK_NODES,
  MOCK_EDGES,
  MOCK_HIGHLIGHT_IDS,
} from "./mockEcosystemData";

// Color maps
const COUNTRY_COLORS = {
  Vietnam: "#10b981",    // Emerald
  Malaysia: "#3b82f6",   // Blue
  Singapore: "#ef4444",  // Coral Red
  Thailand: "#8b5cf6",   // Purple
  Indonesia: "#f59e0b",  // Amber
  Philippines: "#06b6d4",// Cyan
  Unknown: "#94a3b8",
};

const TYPE_COLORS = {
  organisation: "#10b981",               // Emerald
  programme: "#f59e0b",                  // Amber
  startup: "#38bdf8",                    // Sky Blue
  municipal_waste_management: "#10b981", // Emerald
  accelerator_expansion: "#f59e0b",       // Amber
  complementary_startup: "#38bdf8",       // Sky Blue
  other: "#94a3b8",
};

const RELATION_COLORS = {
  complements: "#10b981",  // Emerald
  "same market": "#06b6d4", // Cyan
  "same sector": "#a855f7", // Purple
  default: "#64748b",
};

/**
 * EcosystemGraph Component
 *
 * Visualizes ASEAN partner network graph with multi-attribute styling,
 * connection-weighted node sizing, top-3 match illumination, and interactive tooltips.
 *
 * Props:
 *  - nodes: Array of {id, label, type, country, ...}
 *  - edges: Array of {source, target, relation, weight, ...}
 *  - highlightIds: Array of string IDs (top-3 matches from /api/matches)
 *  - onNodeClick: Callback when a node is clicked (node) => void
 */
export default function EcosystemGraph({
  nodes = MOCK_NODES,
  edges = MOCK_EDGES,
  highlightIds = MOCK_HIGHLIGHT_IDS,
  onNodeClick,
}) {
  // Use mock data if props are empty
  const activeNodesData = nodes && nodes.length > 0 ? nodes : MOCK_NODES;
  const activeEdgesData = edges && edges.length > 0 ? edges : MOCK_EDGES;
  const activeHighlights = highlightIds && highlightIds.length > 0 ? highlightIds : MOCK_HIGHLIGHT_IDS;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Component state
  const [colorMode, setColorMode] = useState("country"); // 'country' | 'type'
  const [relationFilter, setRelationFilter] = useState("all"); // 'all' | 'complements' | 'same market' | 'same sector'
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Degree calculation (connection count per node)
  const degrees = useMemo(() => {
    const degMap = {};
    activeNodesData.forEach((n) => {
      degMap[n.id] = 0;
    });
    activeEdgesData.forEach((e) => {
      const sId = typeof e.source === "object" ? e.source.id : e.source;
      const tId = typeof e.target === "object" ? e.target.id : e.target;
      if (degMap[sId] !== undefined) degMap[sId] += 1;
      if (degMap[tId] !== undefined) degMap[tId] += 1;
    });
    return degMap;
  }, [activeNodesData, activeEdgesData]);

  // Simulation state stored in ref across animation frames
  const simRef = useRef({
    nodes: [],
    edges: [],
    animId: null,
    dragNode: null,
    isDragging: false,
    width: 800,
    height: 600,
    pulseAngle: 0,
  });

  // Initialize simulation nodes and physics
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = (rect.height || 650) - 50; // account for toolbar

    simRef.current.width = width;
    simRef.current.height = height;

    // Filter edges by active filter
    const filteredEdges = activeEdgesData.filter((e) => {
      if (relationFilter === "all") return true;
      return e.relation === relationFilter;
    });

    // Create simulation nodes with initial positions arranged in a radial layout
    const totalNodes = activeNodesData.length;
    const simNodes = activeNodesData.map((n, i) => {
      const existing = simRef.current.nodes.find((en) => en.id === n.id);
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx * 0.5,
          vy: existing.vy * 0.5,
          radius: getNodeRadius(n, degrees[n.id]),
        };
      }
      const angle = (i / totalNodes) * 2 * Math.PI;
      const radius = n.is_startup ? 0 : 180 + (i % 3) * 40;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        radius: getNodeRadius(n, degrees[n.id]),
      };
    });

    // Map edges to references
    const simEdges = filteredEdges
      .map((e) => {
        const sourceNode = simNodes.find(
          (n) => n.id === (typeof e.source === "object" ? e.source.id : e.source)
        );
        const targetNode = simNodes.find(
          (n) => n.id === (typeof e.target === "object" ? e.target.id : e.target)
        );
        if (!sourceNode || !targetNode) return null;
        return {
          ...e,
          source: sourceNode,
          target: targetNode,
        };
      })
      .filter(Boolean);

    simRef.current.nodes = simNodes;
    simRef.current.edges = simEdges;
  }, [activeNodesData, activeEdgesData, relationFilter, degrees]);

  // Main rendering & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      const { nodes: simNodes, edges: simEdges, width, height, dragNode } = simRef.current;
      simRef.current.pulseAngle += 0.05;

      // Handle Retina displays
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Physical simulation tick (spring-embedder + charge repulsion)
      for (let i = 0; i < simNodes.length; i++) {
        const na = simNodes[i];
        if (na === dragNode) continue;

        // Centering force
        const cx = width / 2;
        const cy = height / 2;
        na.vx += (cx - na.x) * 0.0006;
        na.vy += (cy - na.y) * 0.0006;

        // Repulsion between all nodes
        for (let j = i + 1; j < simNodes.length; j++) {
          const nb = simNodes[j];
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const minSafeDist = na.radius + nb.radius + 20;

          if (dist < 400) {
            const force = (300 / distSq) * 1.8;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            na.vx -= fx;
            na.vy -= fy;
            nb.vx += fx;
            nb.vy += fy;
          }

          // Collision prevention
          if (dist < minSafeDist) {
            const overlap = minSafeDist - dist;
            const ox = (dx / dist) * overlap * 0.5;
            const oy = (dy / dist) * overlap * 0.5;
            na.vx -= ox;
            na.vy -= oy;
            nb.vx += ox;
            nb.vy += oy;
          }
        }
      }

      // Spring force along edges
      simEdges.forEach((e) => {
        const u = e.source;
        const v = e.target;
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = e.relation === "complements" ? 110 : 160;
        const springForce = (dist - targetDist) * 0.008 * (e.weight || 0.5);

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (u !== dragNode) {
          u.vx += fx;
          u.vy += fy;
        }
        if (v !== dragNode) {
          v.vx -= fx;
          v.vy -= fy;
        }
      });

      // Update positions with damping
      simNodes.forEach((n) => {
        if (n !== dragNode) {
          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x += n.vx;
          n.y += n.vy;

          // Boundary clamp
          const pad = n.radius + 10;
          n.x = Math.max(pad, Math.min(width - pad, n.x));
          n.y = Math.max(pad, Math.min(height - pad, n.y));
        }
      });

      // 2. Render Frame
      ctx.clearRect(0, 0, width, height);

      // Draw Edges
      simEdges.forEach((e) => {
        const isHovered =
          hoveredNode && (hoveredNode.id === e.source.id || hoveredNode.id === e.target.id);
        const isDimmed = hoveredNode && !isHovered;

        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);

        const strokeColor = RELATION_COLORS[e.relation] || RELATION_COLORS.default;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHovered ? 2.5 : Math.max(1, (e.weight || 0.5) * 2);
        ctx.globalAlpha = isDimmed ? 0.08 : isHovered ? 0.9 : 0.35;

        if (e.relation === "complements") {
          ctx.setLineDash([4, 3]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
      });

      // Draw Nodes
      simNodes.forEach((n) => {
        const isHovered = hoveredNode && hoveredNode.id === n.id;
        const isConnectedToHovered =
          hoveredNode &&
          simEdges.some(
            (e) =>
              (e.source.id === hoveredNode.id && e.target.id === n.id) ||
              (e.target.id === hoveredNode.id && e.source.id === n.id)
          );
        const isDimmed = hoveredNode && !isHovered && !isConnectedToHovered;

        const isHighlighted = activeHighlights.includes(n.id);
        const highlightRank = isHighlighted ? activeHighlights.indexOf(n.id) + 1 : 0;

        const baseColor =
          colorMode === "country"
            ? COUNTRY_COLORS[n.country] || COUNTRY_COLORS.Unknown
            : TYPE_COLORS[n.type] || TYPE_COLORS.other;

        ctx.globalAlpha = isDimmed ? 0.2 : 1.0;

        // 1. Outer Glow for Highlighted Top Matches
        if (isHighlighted) {
          const pulse = 4 + Math.sin(simRef.current.pulseAngle + highlightRank) * 2.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = highlightRank === 1 ? "#fbbf24" : highlightRank === 2 ? "#34d399" : "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Subtle radial glow
          const grad = ctx.createRadialGradient(n.x, n.y, n.radius, n.x, n.y, n.radius + 12);
          grad.addColorStop(0, "rgba(251, 191, 36, 0.35)");
          grad.addColorStop(1, "rgba(251, 191, 36, 0.0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 12, 0, 2 * Math.PI);
          ctx.fill();
        }

        // 2. Startup Special Indicator Ring
        if (n.is_startup) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = "#ec4899";
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 3. Node Main Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Node border
        ctx.strokeStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // 4. Rank Badge if in Top 3
        if (isHighlighted) {
          const badgeX = n.x + n.radius * 0.7;
          const badgeY = n.y - n.radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#f59e0b";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`#${highlightRank}`, badgeX, badgeY);
        }

        // 5. Node Label
        ctx.font = isHovered || isHighlighted || n.is_startup ? "bold 11px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isHovered || isHighlighted ? "#ffffff" : "#cbd5e1";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Truncate label for clean visual presentation
        const cleanLabel = n.label.replace(/\(illustrative\)/i, "").trim();
        const displayLabel = cleanLabel.length > 18 ? cleanLabel.slice(0, 16) + "…" : cleanLabel;
        ctx.fillText(displayLabel, n.x, n.y + n.radius + 4);

        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
      simRef.current.animId = requestAnimationFrame(animate);
    };

    simRef.current.animId = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (simRef.current.animId) {
        cancelAnimationFrame(simRef.current.animId);
      }
    };
  }, [colorMode, hoveredNode, activeHighlights]);

  // Helper: Node size by degree
  function getNodeRadius(node, degree = 0) {
    if (node.is_startup) return 22; // Active startup node is prominent
    const base = 10;
    const scaled = base + Math.min(12, (degree || 0) * 1.8);
    return Math.max(10, Math.min(scaled, 22));
  }

  // Pointer event handlers for Hover, Click, Drag
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clicked = simRef.current.nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (clicked) {
      simRef.current.dragNode = clicked;
      simRef.current.isDragging = true;
      if (onNodeClick) onNodeClick(clicked);
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (simRef.current.isDragging && simRef.current.dragNode) {
      simRef.current.dragNode.x = mouseX;
      simRef.current.dragNode.y = mouseY;
      simRef.current.dragNode.vx = 0;
      simRef.current.dragNode.vy = 0;
      return;
    }

    // Hover detection
    const found = simRef.current.nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (found) {
      setHoveredNode(found);
      setTooltipPos({ x: mouseX, y: mouseY });
    } else {
      setHoveredNode(null);
    }
  };

  const handlePointerUp = () => {
    simRef.current.isDragging = false;
    simRef.current.dragNode = null;
  };

  // Re-center and reheat simulation
  const handleResetLayout = () => {
    const { nodes: simNodes, width, height } = simRef.current;
    simNodes.forEach((n, i) => {
      const angle = (i / simNodes.length) * 2 * Math.PI;
      const r = n.is_startup ? 0 : 180 + (i % 3) * 40;
      n.x = width / 2 + Math.cos(angle) * r;
      n.y = height / 2 + Math.sin(angle) * r;
      n.vx = (Math.random() - 0.5) * 5;
      n.vy = (Math.random() - 0.5) * 5;
    });
  };

  return (
    <div className="ecosystem-graph-container" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="ecosystem-graph-toolbar">
        <div className="toolbar-title-group">
          <h4 className="toolbar-title">ASEAN Partner Ecosystem Network</h4>
          <span className="toolbar-badge">
            {activeNodesData.length} Nodes &bull; {activeEdgesData.length} Edges
          </span>
        </div>

        <div className="toolbar-controls">
          <label className="control-label">Color:</label>
          <select
            className="control-select"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
          >
            <option value="country">By Country</option>
            <option value="type">By Organization Type</option>
          </select>

          <label className="control-label">Relation:</label>
          <select
            className="control-select"
            value={relationFilter}
            onChange={(e) => setRelationFilter(e.target.value)}
          >
            <option value="all">All Relations</option>
            <option value="complements">Complements Only</option>
            <option value="same market">Same Market</option>
            <option value="same sector">Same Sector</option>
          </select>

          <button className="btn-reset" onClick={handleResetLayout} title="Re-heat force simulation">
            Re-center
          </button>
        </div>
      </div>

      {/* Top Match Highlight Banner */}
      {activeHighlights && activeHighlights.length > 0 && (
        <div className="highlight-banner">
          <span>&#9733; Top {activeHighlights.length} Matchmaking Partners Highlighted</span>
        </div>
      )}

      {/* Canvas Area */}
      <div className="graph-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="graph-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            handlePointerUp();
            setHoveredNode(null);
          }}
        />

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div
            className="graph-tooltip"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="tooltip-header">
              <span className="tooltip-title">{hoveredNode.label}</span>
              {activeHighlights.includes(hoveredNode.id) && (
                <span className="tooltip-rank-badge">
                  #{activeHighlights.indexOf(hoveredNode.id) + 1} Top Match
                </span>
              )}
            </div>

            <div className="tooltip-meta">
              <span className="tooltip-meta-item">
                <strong>Country:</strong> {hoveredNode.country}
              </span>
              {hoveredNode.city && (
                <span className="tooltip-meta-item">&bull; {hoveredNode.city}</span>
              )}
            </div>

            <div className="tooltip-meta">
              <span className="tooltip-meta-item">
                <strong>Type:</strong> {hoveredNode.type.replace(/_/g, " ")}
              </span>
            </div>

            {hoveredNode.sectors && hoveredNode.sectors.length > 0 && (
              <div className="tooltip-tags">
                {hoveredNode.sectors.slice(0, 3).map((sec, i) => (
                  <span key={i} className="tooltip-tag">
                    {sec}
                  </span>
                ))}
              </div>
            )}

            <div className="tooltip-connections">
              Connected to {degrees[hoveredNode.id] || 0} ecosystem nodes
            </div>
          </div>
        )}

        {/* Overlay Legend */}
        <div className="graph-legend-overlay">
          <div className="legend-title">
            {colorMode === "country" ? "ASEAN Countries" : "Entity Types"}
          </div>
          <div className="legend-items">
            {colorMode === "country" ? (
              <>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Vietnam }} />
                  <span>Vietnam</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Malaysia }} />
                  <span>Malaysia</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Singapore }} />
                  <span>Singapore</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Thailand }} />
                  <span>Thailand</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Indonesia }} />
                  <span>Indonesia</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: COUNTRY_COLORS.Philippines }} />
                  <span>Philippines</span>
                </div>
              </>
            ) : (
              <>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: TYPE_COLORS.organisation }} />
                  <span>Organisation / Municipal</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: TYPE_COLORS.programme }} />
                  <span>Programme / Accelerator</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: TYPE_COLORS.startup }} />
                  <span>Startup / Scaleup</span>
                </div>
              </>
            )}

            <div style={{ margin: "4px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
            <div className="legend-item">
              <span className="legend-line" style={{ background: RELATION_COLORS.complements }} />
              <span>Complements (Dashed)</span>
            </div>
            <div className="legend-item">
              <span className="legend-line" style={{ background: RELATION_COLORS["same market"] }} />
              <span>Same Target Market</span>
            </div>
            <div className="legend-item">
              <span className="legend-line" style={{ background: RELATION_COLORS["same sector"] }} />
              <span>Same Sector</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
