// ============================================
// WorkspaceSettings.jsx
// Place in: frontend/src/WorkspaceSettings.jsx
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

const ROLE_COLORS = {
  admin:   { bg: '#E1F5EE', color: '#0F6E56' },
  manager: { bg: '#E6F1FB', color: '#185FA5' },
  member:  { bg: '#F1EFE8', color: '#5F5E5A' },
};

function RoleBadge({ role }) {
  const style = ROLE_COLORS[role] || ROLE_COLORS.member;
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      fontSize: '11px',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: '999px',
    }}>
      {role}
    </span>
  );
}

function Avatar({ name }) {
  const initials = name?.slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: '#E6F1FB', color: '#185FA5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function WorkspaceSettings({ workspaceId, onClose }) {
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState('member');
  const [loading, setLoading] = useState(true);

  // Invite form
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  async function fetchWorkspace() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/workspaces/${workspaceId}`, { headers });
      setWorkspace(res.data);
      setMembers(res.data.members || []);
      setMyRole(res.data.myRole);
    } catch (err) {
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteUsername.trim()) return toast.error('Enter a username');
    setInviting(true);
    try {
      await axios.post(`${API}/api/workspaces/${workspaceId}/invite`,
        { username: inviteUsername.trim(), role: inviteRole },
        { headers }
      );
      toast.success(`${inviteUsername} added as ${inviteRole}`);
      setInviteUsername('');
      fetchWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invite failed');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      await axios.put(
        `${API}/api/workspaces/${workspaceId}/members/${memberId}`,
        { role: newRole },
        { headers }
      );
      toast.success('Role updated');
      fetchWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  }

  async function handleRemove(memberId, username) {
    if (!window.confirm(`Remove ${username} from workspace?`)) return;
    try {
      await axios.delete(
        `${API}/api/workspaces/${workspaceId}/members/${memberId}`,
        { headers }
      );
      toast.success(`${username} removed`);
      fetchWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  }

  if (loading) return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p style={{ color: 'var(--color-text-secondary)', padding: '2rem', textAlign: 'center' }}>
          Loading...
        </p>
      </div>
    </div>
  );

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>
              {workspace?.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {members.length} member{members.length !== 1 ? 's' : ''} · Your role: <RoleBadge role={myRole} />
            </p>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Invite section — admin only */}
        {myRole === 'admin' && (
          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>Invite member</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Username"
                value={inviteUsername}
                onChange={e => setInviteUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                style={{ flex: 1, fontSize: '13px' }}
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ fontSize: '13px', width: '110px' }}
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting}
                style={inviteBtnStyle}
              >
                {inviting ? '...' : 'Invite'}
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>Members</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map(member => (
              <div key={member.id} style={memberRowStyle}>
                <Avatar name={member.username} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{member.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>

                {myRole === 'admin' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value)}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="member">member</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.id, member.username)}
                      style={removeBtnStyle}
                      title="Remove member"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <RoleBadge role={member.role} />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: 'var(--color-background-primary)',
  borderRadius: '12px',
  border: '0.5px solid var(--color-border-tertiary)',
  padding: '1.5rem',
  width: '100%',
  maxWidth: '520px',
  maxHeight: '85vh',
  overflowY: 'auto',
};

const sectionStyle = {
  marginBottom: '1.5rem',
};

const sectionLabelStyle = {
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '10px',
};

const memberRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  background: 'var(--color-background-secondary)',
  borderRadius: '8px',
  border: '0.5px solid var(--color-border-tertiary)',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  padding: '4px 8px',
  borderRadius: '6px',
};

const inviteBtnStyle = {
  padding: '6px 16px',
  fontSize: '13px',
  fontWeight: 500,
  background: '#1D9E75',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const removeBtnStyle = {
  background: 'none',
  border: '0.5px solid var(--color-border-secondary)',
  borderRadius: '6px',
  padding: '2px 8px',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  fontSize: '12px',
};
