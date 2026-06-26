import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import WorkspaceSettings from './WorkspaceSettings';

function Dashboard({ user, onOpenBoard, onLogout }) {
  const [hovered, setHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // For now using a default workspaceId of 1.
  // Later when you add workspace creation flow, replace with the real selected workspace id.
  const activeWorkspaceId = 1;

  const avatarLetter = user.username ? user.username[0].toUpperCase() : '?';

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
    }}>
      <Toaster position="bottom-right" toastOptions={{
        style: { fontFamily: "'Segoe UI', sans-serif", fontSize: 13, fontWeight: 600 }
      }} />

      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'url("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80") center/cover no-repeat',
        filter: 'blur(0px)',
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.1)' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 28px',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{
            fontSize: 26, fontWeight: 900, letterSpacing: '2px',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontStyle: 'italic', fontFamily: "'Georgia', serif"
          }}>
            TaskFlow
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* ── NEW: Workspace Settings button ── */}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 7, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s ease',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              ⚙️ Workspace
            </button>

            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {avatarLetter}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>
              {user.username}
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 7, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: '40px 28px' }}>

          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              color: '#fff', fontSize: 22, fontWeight: 700,
              margin: '0 0 4px', letterSpacing: '-0.3px',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              My Boards
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>
              Click a board to open it
            </p>
          </div>

          {/* Boards grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

            {/* Board card */}
            <div
              onClick={onOpenBoard}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                width: 200, height: 120,
                borderRadius: 12, cursor: 'pointer',
                background: hovered
                  ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
                  : 'linear-gradient(135deg, #2563eb, #6366f1)',
                boxShadow: hovered
                  ? '0 12px 32px rgba(37,99,235,0.5)'
                  : '0 4px 16px rgba(37,99,235,0.35)',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', right: -20, top: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }} />
              <div style={{
                position: 'absolute', right: 10, bottom: -30,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)'
              }} />

              <div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>📋</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                  My Board
                </div>
              </div>

              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500 }}>
                Click to open →
              </div>
            </div>

            {/* + Create Board placeholder */}
            <div
              onClick={() => toast('Multiple boards coming soon! 🚀', { icon: '🛠️' })}
              style={{
                width: 200, height: 120,
                borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)',
                border: '2px dashed rgba(255,255,255,0.25)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
            >
              <span style={{ fontSize: 24, opacity: 0.6 }}>+</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                Create Board
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ── NEW: WorkspaceSettings modal ── */}
      {showSettings && (
        <WorkspaceSettings
          workspaceId={activeWorkspaceId}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
}

export default Dashboard;
