import React, { useState } from "react";
import EcosystemGraph from "./EcosystemGraph";
import {
  MOCK_NODES,
  MOCK_EDGES,
  MOCK_HIGHLIGHT_IDS,
} from "./mockEcosystemData";

export default function EcosystemGraphDemo() {
  const [selectedNode, setSelectedNode] = useState(null);

  const topMatches = MOCK_NODES.filter((n) =>
    MOCK_HIGHLIGHT_IDS.includes(n.id)
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 8px 0" }}>Ecosystem Network Graph Preview</h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
          Cross-border smart-waste expansion (Malaysia &rarr; Vietnam). Nodes sized by connectivity, highlighted for top matches from <code>/api/matches</code>.
        </p>
      </header>

      {/* Graph Component */}
      <EcosystemGraph
        nodes={MOCK_NODES}
        edges={MOCK_EDGES}
        highlightIds={MOCK_HIGHLIGHT_IDS}
        onNodeClick={(node) => setSelectedNode(node)}
      />

      {/* Selected Node Drawer or Top Matches Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        {/* Top Matches Card */}
        <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px" }}>
          <h3 style={{ fontSize: "14px", margin: "0 0 12px 0", color: "#fbbf24" }}>
            &#9733; Top Matchmaking Candidates (/api/matches)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topMatches.map((partner, idx) => (
              <div
                key={partner.id}
                onClick={() => setSelectedNode(partner)}
                style={{
                  background: selectedNode?.id === partner.id ? "rgba(251, 191, 36, 0.15)" : "rgba(255,255,255,0.04)",
                  border: selectedNode?.id === partner.id ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#f1f5f9" }}>
                    #{idx + 1} {partner.label}
                  </span>
                  <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "2px 6px", borderRadius: "4px" }}>
                    {partner.country}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  {partner.type.replace(/_/g, " ")} &bull; {partner.city}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Entity Inspector */}
        <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px" }}>
          <h3 style={{ fontSize: "14px", margin: "0 0 12px 0", color: "#38bdf8" }}>
            Node Inspector {selectedNode ? `(${selectedNode.label})` : "(Click any node)"}
          </h3>
          {selectedNode ? (
            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#cbd5e1" }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>ID:</strong> {selectedNode.id}
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Country & City:</strong> {selectedNode.country} {selectedNode.city && `(${selectedNode.city})`}
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Type:</strong> {selectedNode.type}
              </p>
              {selectedNode.capabilities && (
                <div style={{ margin: "0 0 8px 0" }}>
                  <strong>Capabilities:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                    {selectedNode.capabilities.map((c, i) => (
                      <span key={i} style={{ background: "rgba(56, 189, 248, 0.15)", color: "#7dd3fc", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedNode.needs && (
                <div>
                  <strong>Needs:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                    {selectedNode.needs.map((n, i) => (
                      <span key={i} style={{ background: "rgba(244, 63, 94, 0.15)", color: "#fda4af", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic", padding: "20px 0" }}>
              Click on any node in the graph above or from the top matches to inspect its attributes, capabilities, and needs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
