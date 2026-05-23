import { useState } from 'react';

export function TrashButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Delete"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '2px 4px', borderRadius: 5, lineHeight: 1,
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 0.2s ease, transform 0.15s ease',
        transform: hovered ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={hovered ? '#ef4444' : '#78716c'} strokeWidth="2"
        style={{ transition: 'stroke 0.2s ease', display: 'block' }}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
    </button>
  );
}

export function EditableTitle({ value, onDoubleClick, isList }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Double-click to edit"
      style={{
        fontSize: isList ? 14 : 13,
        fontWeight: isList ? 700 : 600,
        color: '#1c1917',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 6px', borderRadius: 5,
        background: hovered ? 'rgba(0,0,0,0.05)' : 'transparent',
        transition: 'background 0.15s ease',
        maxWidth: '155px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
    >
      {value}
      {hovered && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2.5" style={{ flexShrink: 0 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
    </span>
  );
}
