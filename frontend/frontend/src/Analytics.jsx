// Analytics.jsx
// Place in: frontend/src/Analytics.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const API = "https://taskflow-production-0940.up.railway.app/api";

const STATUS_COLORS = {
  todo: '#9ca3af',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  done: '#10b981',
};

const PRIORITY_COLORS = {
  low: '#9ca3af',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

const STATUS_LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: `1px solid #f0ede8`,
      borderTop: `3px solid ${color}`,
      flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '1px solid #f0ede8',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

export default function Analytics({ boardId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;
    axios.get(`${API}/boards/${boardId}/analytics`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [boardId]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fafaf9', borderRadius: 16,
        width: '100%', maxWidth: 900,
        maxHeight: '90vh', overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1c1917' }}>📊 Board Analytics</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a8a29e' }}>Real-time insights from your board data</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', color: '#a8a29e', padding: '4px 8px', borderRadius: 6,
          }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e', fontSize: 14 }}>
            Loading analytics...
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e', fontSize: 14 }}>
            No data available yet. Create some cards first!
          </div>
        ) : (
          <>
            {/* ── Stat cards row ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <StatCard
                label="Total Cards" value={data.summary.totalCards}
                sub="across all lists" color="#2563eb"
              />
              <StatCard
                label="Completion Rate" value={`${data.summary.completionRate}%`}
                sub={`${data.summary.completed} done`} color="#10b981"
              />
              <StatCard
                label="Overdue" value={data.summary.overdue}
                sub="need attention" color="#f59e0b"
              />
              <StatCard
                label="Critical" value={data.summary.critical}
                sub="high priority" color="#ef4444"
              />
            </div>

            {/* ── Charts 2x2 grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Chart 1: Cards per list (bar) */}
              <ChartCard title="Cards per List">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.cardsPerList} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0ede8' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Cards" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 2: Status breakdown (pie) */}
              <ChartCard title="Status Breakdown">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.statusBreakdown.map(d => ({
                        name: STATUS_LABELS[d.status] || d.status,
                        value: parseInt(d.count),
                        status: d.status,
                      }))}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.statusBreakdown.map((d, i) => (
                        <Cell key={i} fill={STATUS_COLORS[d.status] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0ede8' }}
                    />
                    <Legend iconSize={10} iconType="circle"
                      formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 3: Priority breakdown (bar) */}
              <ChartCard title="Priority Breakdown">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={data.priorityBreakdown.map(d => ({
                      name: d.priority ? d.priority.charAt(0).toUpperCase() + d.priority.slice(1) : 'Unknown',
                      count: parseInt(d.count),
                      priority: d.priority,
                    }))}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0ede8' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Cards">
                      {data.priorityBreakdown.map((d, i) => (
                        <Cell key={i} fill={PRIORITY_COLORS[d.priority] || '#9ca3af'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 4: Weekly activity (line) */}
              <ChartCard title="Weekly Activity (last 6 weeks)">
                {data.weeklyActivity.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#a8a29e', fontSize: 12 }}>
                    No activity data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.weeklyActivity} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0ede8' }} />
                      <Line
                        type="monotone" dataKey="created"
                        stroke="#2563eb" strokeWidth={2}
                        dot={{ fill: '#2563eb', r: 4 }}
                        name="Actions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
