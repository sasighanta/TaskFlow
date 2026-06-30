// FilterBar.jsx
// Place in: frontend/src/FilterBar.jsx

import { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['todo', 'in_progress', 'blocked', 'done'];

const PRIORITY_DOT = {
  low: '#9ca3af', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};
const STATUS_LABEL = {
  todo: 'Todo', in_progress: 'In Progress', blocked: 'Blocked', done: 'Done',
};

export default function FilterBar({ allCards, onFilteredChange }) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Compute filtered card IDs and notify parent
  const applyFilters = (newSearch, newPriority, newStatus, newOverdue) => {
    let filtered = allCards;

    if (newSearch.trim()) {
      const q = newSearch.toLowerCase();
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.labels?.some(l => l.toLowerCase().includes(q))
      );
    }
    if (newPriority) {
      filtered = filtered.filter(c => c.priority === newPriority);
    }
    if (newStatus) {
      filtered = filtered.filter(c => c.status === newStatus);
    }
    if (newOverdue) {
      filtered = filtered.filter(c =>
        c.due_date && new Date(c.due_date) < new Date() && c.status !== 'done'
      );
    }

    const matchIds = new Set(filtered.map(c => c.id));
    onFilteredChange(matchIds, filtered.length, hasActiveFilters(newSearch, newPriority, newStatus, newOverdue));
  };

  const hasActiveFilters = (s, p, st, o) => !!(s.trim() || p || st || o);

  const handleSearchChange = (val) => {
    setSearch(val);
    applyFilters(val, priorityFilter, statusFilter, overdueOnly);
  };
  const handlePriorityClick = (p) => {
    const next = priorityFilter === p ? null : p;
    setPriorityFilter(next);
    applyFilters(search, next, statusFilter, overdueOnly);
  };
  const handleStatusClick = (s) => {
    const next = statusFilter === s ? null : s;
    setStatusFilter(next);
    applyFilters(search, priorityFilter, next, overdueOnly);
  };
  const handleOverdueClick = () => {
    const next = !overdueOnly;
    setOverdueOnly(next);
    applyFilters(search, priorityFilter, statusFilter, next);
  };
  const clearAll = () => {
    setSearch(''); setPriorityFilter(null); setStatusFilter(null); setOverdueOnly(false);
    onFilteredChange(null, 0, false);
  };

  const isActive = search.trim() || priorityFilter || statusFilter || overdueOnly;

  return (
    <div style={{
      padding: '0 24px 12px',
      display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
    }}>
      {/* Search input */}
      <div style={{ position: 'relative', minWidth: 200 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.6 }}>🔍</span>
        <input
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search cards..."
          style={{
            width: '100%', padding: '7px 12px 7px 30px',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.92)', fontSize: 13,
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Priority pills */}
      <div style={{ display: 'flex', gap: 4 }}>
        {PRIORITIES.map(p => (
          <button key={p} onClick={() => handlePriorityClick(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 20,
              border: priorityFilter === p ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.3)',
              background: priorityFilter === p ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_DOT[p] }} />
            {p}
          </button>
        ))}
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 4 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => handleStatusClick(s)}
            style={{
              padding: '6px 10px', borderRadius: 20,
              border: statusFilter === s ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.3)',
              background: statusFilter === s ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Overdue toggle */}
      <button onClick={handleOverdueClick}
        style={{
          padding: '6px 10px', borderRadius: 20,
          border: overdueOnly ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.3)',
          background: overdueOnly ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)',
          color: overdueOnly ? '#fecaca' : '#fff',
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}
      >
        ⏰ Overdue
      </button>

      {/* Clear button */}
      {isActive && (
        <button onClick={clearAll}
          style={{
            padding: '6px 10px', borderRadius: 20,
            border: 'none', background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Clear all ✕
        </button>
      )}
    </div>
  );
}
