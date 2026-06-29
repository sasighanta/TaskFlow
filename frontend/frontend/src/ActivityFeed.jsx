// ActivityFeed.jsx
// Place in: frontend/src/ActivityFeed.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://taskflow-production-0940.up.railway.app/api";

// Action icon mapping
function getActionIcon(action) {
  if (action.includes('created card')) return '🟢';
  if (action.includes('deleted card')) return '🔴';
  if (action.includes('moved card')) return '🔀';
  if (action.includes('renamed card')) return '✏️';
  if (action.includes('updated description')) return '📝';
  if (action.includes('created list')) return '📋';
  if (action.includes('deleted list')) return '🗑️';
  if (action.includes('renamed list')) return '✏️';
  return '⚡';
}

// Format relative time
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Avatar circle
function Avatar({ name }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {name?.slice(0, 2).toUpperCase() || '?'}
    </div>
  );
}

export default function ActivityFeed({ boardId, isOpen, onClose, socket }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!boardId) return;
    try {
      const res = await axios.get(`${API}/boards/${boardId}/activity`);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && boardId) {
      fetchLogs();
    }
  }, [isOpen, boardId]);

  // Re-fetch when board updates via socket
  useEffect(() => {
    if (!socket) return;
    socket.on('board-updated', () => {
      if (isOpen) fetchLogs();
    });
    return () => socket.off('board-updated');
  }, [socket, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 998,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 320, height: '100vh',
        background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 999,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Segoe UI', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0ede8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fafaf9',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1917' }}>
              Activity
            </div>
            <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
              Last 50 actions on this board
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              fontSize: 18, cursor: 'pointer',
              color: '#a8a29e', padding: '4px 8px',
              borderRadius: 6,
            }}
          >✕</button>
        </div>

        {/* Log list */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '12px 16px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#e5e7eb transparent',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a8a29e', fontSize: 13 }}>
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ color: '#a8a29e', fontSize: 13 }}>No activity yet</div>
              <div style={{ color: '#d1d5db', fontSize: 12, marginTop: 4 }}>
                Actions will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 8px',
                    borderRadius: 8,
                    background: index === 0 ? '#f0f9ff' : 'transparent',
                    borderBottom: '1px solid #f5f5f4',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9f9f8'}
                  onMouseLeave={e => e.currentTarget.style.background = index === 0 ? '#f0f9ff' : 'transparent'}
                >
                  <Avatar name={log.username} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#1c1917', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>{log.username}</span>
                      {' '}
                      <span style={{ color: '#78716c' }}>{log.action}</span>
                      {' '}
                      {log.entity_title && (
                        <span style={{
                          fontWeight: 600, color: '#2563eb',
                          background: '#eff6ff', padding: '1px 6px',
                          borderRadius: 4, fontSize: 11,
                        }}>
                          {log.entity_title}
                        </span>
                      )}
                      {/* Show moved from→to if available */}
                      {log.metadata?.from && log.metadata?.to && (
                        <span style={{ color: '#9ca3af', fontSize: 11 }}>
                          {' '}({log.metadata.from} → {log.metadata.to})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 3 }}>
                      {getActionIcon(log.action)} {timeAgo(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0ede8',
          background: '#fafaf9',
        }}>
          <button
            onClick={fetchLogs}
            style={{
              width: '100%', padding: '8px',
              background: 'none', border: '1px solid #e5e7eb',
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: '#78716c', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </>
  );
}
