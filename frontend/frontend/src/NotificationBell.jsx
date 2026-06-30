// NotificationBell.jsx
// Place in: frontend/src/NotificationBell.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://taskflow-production-0940.up.railway.app/api";

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/notifications/${userId}/read-all`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', borderRadius: 7, padding: '6px 10px',
          fontSize: 14, cursor: 'pointer', position: 'relative',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff',
            fontSize: 9, fontWeight: 700,
            width: 16, height: 16, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 320, maxHeight: 400, overflowY: 'auto',
            background: '#fff', borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            zIndex: 999, fontFamily: "'Segoe UI', sans-serif",
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #f0ede8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  background: 'none', border: 'none', fontSize: 11,
                  color: '#2563eb', cursor: 'pointer', fontWeight: 600,
                }}>Mark all read</button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#a8a29e', fontSize: 12 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #f5f5f4',
                  background: n.is_read ? '#fff' : '#fef3c7',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#1c1917', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: '#a8a29e', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
