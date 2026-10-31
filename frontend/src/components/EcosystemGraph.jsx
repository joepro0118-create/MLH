import React, { useEffect, useState } from 'react';
import { Network, Globe2, RefreshCw, Info } from 'lucide-react';
import { getEcosystemGraph } from '../services/api';

const TYPE_STYLES = {
  startup: {
    bg: '#16a34a',
    ring: 'rgba(22, 163, 74, 0.2)',
    label: 'Startup',
  },
  programme: {
    bg: '#2563eb',
    ring: 'rgba(37, 99, 235, 0.2)',
    label: 'Programme / Sandbox',
  },
  organisation: {
    bg: '#7c3aed',
    ring: 'rgba(124, 58, 237, 0.2)',
    label: 'Organisation / Operator',
  },
};

export function EcosystemGraph({ startup, matches, allowOfflineFallback = true }) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sourceMode, setSourceMode] = useState('backend');

  const loadGraph = async () => {
    setLoading(true);
    try {
      const res = await getEcosystemGraph({ allowOfflineFallback });
      setGraph(res.data || { nodes: [], edges: [] });
      setSourceMode(res.source);
    } catch {
      setGraph({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [allowOfflineFallback]);

  const width = 820;
  const height = 430;
  const centerX = width / 2;
  const centerY = height / 2;

  const positionedNodes = React.useMemo(() => {
    if (!graph.nodes?.length) return [];
    return graph.nodes.map((node, index) => {
      if (index === 0) {
        return { ...node, x: centerX, y: centerY, isCenter: true };
      }
      const totalOuter = graph.nodes.length - 1;
      const angle = ((index - 1) / totalOuter) * Math.PI * 2 - Math.PI / 2;
      const radiusX = 275;
      const radiusY = 155;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY,
        isCenter: false,
      };
    });
  }, [graph.nodes]);

  const nodeMap = React.useMemo(() => {
    const map = {};
    positionedNodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [positionedNodes]);

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb] border border-blue-200">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1e293b]">
                ASEAN Cross-Border Ecosystem Graph
              </h3>
              <span className="rounded-full border border-[#fcd34d] bg-[#fffbeb] px-2.5 py-0.5 text-xs font-semibold text-[#92400e]">
                Illustrative Demo Data
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              Interactive regional node map via{' '}
              <code className="font-mono-code text-[#2563eb]">GET /api/ecosystem/graph</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-[#64748b] bg-[#f8fafc] px-3.5 py-1.5 rounded-lg border border-[#e2e8f0]">
            {Object.entries(TYPE_STYLES).map(([key, style]) => (
              <span key={key} className="flex items-center gap-1.5 font-medium text-[#1e293b]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: style.bg }}
                />
                {style.label}
              </span>
            ))}
          </div>

          <button
            onClick={loadGraph}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-slate-200/70 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#2563eb]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Canvas / SVG Network */}
      {loading ? (
        <div className="my-6 flex h-80 flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#e2e8f0] border-t-[#2563eb]" />
          <p className="text-sm text-[#64748b]">Loading ASEAN ecosystem nodes...</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-3 relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-[380px] select-none"
            >
              {/* Center radar rings */}
              <circle
                cx={centerX}
                cy={centerY}
                r={130}
                fill="none"
                stroke="#cbd5e1"
                strokeDasharray="4 6"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={240}
                fill="none"
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />

              {/* Edges */}
              {graph.edges?.map((edge, idx) => {
                const s = nodeMap[edge.source];
                const t = nodeMap[edge.target];
                if (!s || !t) return null;
                const midX = (s.x + t.x) / 2;
                const midY = (s.y + t.y) / 2;
                const isStrong = (edge.weight || 0.7) >= 0.85;

                return (
                  <g key={idx}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isStrong ? '#2563eb' : '#94a3b8'}
                      strokeWidth={isStrong ? 2.5 : 1.5}
                      strokeDasharray={isStrong ? undefined : '5 4'}
                    />
                    {edge.relation && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-58}
                          y={-10}
                          width={116}
                          height={20}
                          rx={6}
                          fill="#ffffff"
                          stroke={isStrong ? '#93c5fd' : '#cbd5e1'}
                          strokeWidth={1}
                        />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill={isStrong ? '#1d4ed8' : '#64748b'}
                          fontSize="10"
                          fontWeight="600"
                        >
                          {edge.relation}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {positionedNodes.map((node) => {
                const style = TYPE_STYLES[node.type] || TYPE_STYLES.organisation;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={node.isCenter ? 32 : 24}
                      fill={style.ring}
                      stroke={isSelected ? '#1e293b' : style.bg}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <circle
                      r={node.isCenter ? 20 : 14}
                      fill={style.bg}
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="800"
                    >
                      {node.country?.slice(0, 2).toUpperCase() || 'AS'}
                    </text>

                    {/* Node Label Pill */}
                    <g transform={`translate(0, ${node.isCenter ? 46 : 38})`}>
                      <rect
                        x={-88}
                        y={-11}
                        width={176}
                        height={22}
                        rx={6}
                        fill="#ffffff"
                        stroke="#cbd5e1"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#1e293b"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {node.label.length > 24 ? `${node.label.slice(0, 22)}…` : node.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Side Inspector Panel */}
          <div className="flex flex-col justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-3">
                <Globe2 className="h-4 w-4" />
                Node Inspector
              </div>

              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <span className="inline-block rounded-md bg-[#eff6ff] border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] uppercase">
                      {selectedNode.type} · {selectedNode.country}
                    </span>
                    <h4 className="mt-1.5 text-sm font-bold text-[#1e293b]">
                      {selectedNode.label}
                    </h4>
                    <p className="text-xs text-[#64748b] font-mono-code mt-0.5">
                      ID: {selectedNode.id}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 text-xs text-[#64748b] leading-relaxed">
                    Connected in the illustrative ASEAN cross-border outcome conversion network. Click any node on the canvas to inspect its regional links.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Click any node in the ASEAN network graph to inspect its country role, entity type, and cross-border partnership links.
                </p>
              )}

              {startup && (
                <div className="mt-4 border-t border-[#e2e8f0] pt-3">
                  <div className="text-[11px] font-semibold uppercase text-[#64748b]">
                    Active Hub Startup
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#2563eb]">
                    {startup.company_name}
                  </div>
                  <div className="text-xs text-[#64748b]">
                    {startup.country} → {startup.target_markets?.join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-[11px] text-[#64748b] flex items-start gap-2">
              <Info className="h-4 w-4 text-[#2563eb] shrink-0 mt-0.5" />
              <span>
                Source: {sourceMode === 'backend' ? 'Live FastAPI /api/ecosystem/graph' : 'Illustrative Fallback Graph'} ({graph.nodes?.length || 0} nodes, {graph.edges?.length || 0} edges)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EcosystemGraph;
