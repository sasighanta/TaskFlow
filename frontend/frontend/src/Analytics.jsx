// Analytics.jsx — Pure SVG/HTML charts, no external dependencies
// Place in: frontend/src/Analytics.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://taskflow-production-0940.up.railway.app/api";

const STATUS_COLORS = {
  todo: '#9ca3af', in_progress: '#3b82f6', blocked: '#ef4444', done: '#10b981',
};
const PRIORITY_COLORS = {
  low: '#9ca3af', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};
const STATUS_LABELS = {
  todo: 'Todo', in_progress: 'In Progress', blocked: 'Blocked', done: 'Done',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderTop: `3px solid ${color}`, flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0ede8' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

// Pure SVG bar chart
function BarChart({ data, colorKey, colors, height = 160 }) {
  if (!data || data.length === 0) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 12 }}>No data yet</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(48, (340 / data.length) - 12);
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" height={height + 40} viewBox={`0 0 ${Math.max(340, data.length * (barWidth + 12) + 20)} ${height + 40}`}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / max) * height);
          const x = 10 + i * (barWidth + 12);
          const y = height - barH;
          const color = colors ? (colors[d[colorKey]] || '#3b82f6') : '#2563eb';
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={color} rx={4} />
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={11} fill="#6b7280">{d.value}</text>
              <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={height} x2="100%" y2={height} stroke="#f0ede8" strokeWidth={1} />
      </svg>
    </div>
  );
}

// Pure SVG donut chart
function DonutChart({ data, colors, size = 160 }) {
  if (!data || data.length === 0) return <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 12 }}>No data yet</div>;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2;
  const R = size * 0.38, r = size * 0.22;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle);
    const lx1 = cx + r * Math.cos(angle - sweep), ly1 = cy + r * Math.sin(angle - sweep);
    const lx2 = cx + r * Math.cos(angle), ly2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${lx2} ${ly2} A ${r} ${r} 0 ${large} 0 ${lx1} ${ly1} Z`, color: colors[d.key] || '#9ca3af', label: d.label, value: d.value };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1c1917">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#9ca3af">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{s.label} <strong style={{ color: '#1c1917' }}>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pure SVG line chart
function LineChart({ data, height = 160 }) {
  if (!data || data.length === 0) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 12 }}>No activity data yet</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 340, pad = 20;
  const points = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2),
    y: height - pad - (d.value / max) * (height - pad * 2),
    ...d
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg width="100%" height={height + 30} viewBox={`0 0 ${w} ${height + 30}`}>
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#2563eb" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={10} fill="#6b7280">{p.value}</text>
          <text x={p.x} y={height + 20} textAnchor="middle" fontSize={9} fill="#9ca3af">{p.label}</text>
        </g>
      ))}
      <line x1={0} y1={height - pad} x2={w} y2={height - pad} stroke="#f0ede8" />
    </svg>
  );
}

export default function Analytics({ boardId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;
    axios.get(`${API}/boards/${boardId}/analytics`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [boardId]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: '#fafaf9', borderRadius: 16, width: '100%', maxWidth: 880, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1c1917' }}>📊 Board Analytics</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a8a29e' }}>Real-time insights from your board data</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#a8a29e', padding: '4px 8px', borderRadius: 6 }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e', fontSize: 14 }}>Loading analytics...</div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e', fontSize: 14 }}>No data available yet.</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <StatCard label="Total Cards" value={data.summary.totalCards} sub="across all lists" color="#2563eb" />
              <StatCard label="Completion Rate" value={`${data.summary.completionRate}%`} sub={`${data.summary.completed} done`} color="#10b981" />
              <StatCard label="Overdue" value={data.summary.overdue} sub="need attention" color="#f59e0b" />
              <StatCard label="Critical" value={data.summary.critical} sub="high priority" color="#ef4444" />
            </div>

            {/* Charts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <ChartCard title="Cards per List">
                <BarChart
                  data={data.cardsPerList.map(d => ({ label: d.title, value: parseInt(d.count) }))}
                />
              </ChartCard>

              <ChartCard title="Status Breakdown">
                <DonutChart
                  data={data.statusBreakdown.map(d => ({ key: d.status, label: STATUS_LABELS[d.status] || d.status, value: parseInt(d.count) }))}
                  colors={STATUS_COLORS}
                />
              </ChartCard>

              <ChartCard title="Priority Breakdown">
                <BarChart
                  data={data.priorityBreakdown.map(d => ({ label: d.priority ? d.priority.charAt(0).toUpperCase() + d.priority.slice(1) : '?', value: parseInt(d.count), key: d.priority }))}
                  colorKey="key"
                  colors={PRIORITY_COLORS}
                />
              </ChartCard>

              <ChartCard title="Weekly Activity (last 6 weeks)">
                <LineChart
                  data={data.weeklyActivity.map(d => ({ label: d.week, value: parseInt(d.created) }))}
                />
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
