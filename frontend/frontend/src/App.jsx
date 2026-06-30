import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Auth from './Auth';
import Dashboard from './Dashboard';
import toast, { Toaster } from 'react-hot-toast';
import { TrashButton, EditableTitle } from './components';
import socket from './socket';
import ActivityFeed from './ActivityFeed';
import NotificationBell from './NotificationBell';
import FilterBar from './FilterBar';

const API = "https://taskflow-production-0940.up.railway.app/api";

const TAGS = [
  { tag: 'tag-blue', label: 'Design' },
  { tag: 'tag-green', label: 'Feature' },
  { tag: 'tag-amber', label: 'Backend' },
  { tag: 'tag-red', label: 'Bug' },
];

const TAG_STYLES = {
  'tag-blue':  { background: '#dbeafe', color: '#1d4ed8' },
  'tag-green': { background: '#dcfce7', color: '#15803d' },
  'tag-amber': { background: '#fef9c3', color: '#92400e' },
  'tag-red':   { background: '#fee2e2', color: '#b91c1c' },
};

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  medium:   { label: 'Medium',   color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6' },
  high:     { label: 'High',     color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
};

const STATUS_CONFIG = {
  todo:        { label: 'Todo',        color: '#6b7280', bg: '#f3f4f6' },
  in_progress: { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' },
  blocked:     { label: 'Blocked',     color: '#dc2626', bg: '#fee2e2' },
  done:        { label: 'Done',        color: '#15803d', bg: '#dcfce7' },
};

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}
function isDueSoon(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  const due = new Date(dueDate);
  const hoursLeft = (due - new Date()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft < 24;
}
function formatDueDate(dueDate) {
  const d = new Date(dueDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let tagIndex = 0;

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showBoard, setShowBoard] = useState(false);
  const [data, setData] = useState({ lists: [], cards: [] });
  const [newList, setNewList] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [cardInputs, setCardInputs] = useState({});
  const [addingCard, setAddingCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingList, setEditingList] = useState(null);
  const [editListTitle, setEditListTitle] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalDesc, setModalDesc] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalStatus, setModalStatus] = useState('todo');
  const [modalLabels, setModalLabels] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const [modalDueDate, setModalDueDate] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showActivity, setShowActivity] = useState(false);

  // ── NEW: Filter state ───────────────────────────────────────────────────
  const [matchedCardIds, setMatchedCardIds] = useState(null); // null = no filter active
  const [matchCount, setMatchCount] = useState(0);
  const [filtersActive, setFiltersActive] = useState(false);

  const boardId = data.board?.id;

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API}/user/${user.id}/board`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch board", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boardId || !showBoard) return;
    socket.emit('join-board', boardId);
    socket.on('board-updated', ({ type, payload }) => {
      fetchBoard();
    });
    return () => {
      socket.emit('leave-board', boardId);
      socket.off('board-updated');
    };
  }, [boardId, showBoard]);

  useEffect(() => {
    if (user && showBoard) fetchBoard();
  }, [user, showBoard]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    let updatedCards = [...data.cards];
    const dragged = updatedCards.find(c => c.id === parseInt(draggableId));
    const fromListId = source.droppableId;
    const toListId = destination.droppableId;
    updatedCards = updatedCards.filter(c => c.id !== dragged.id);
    dragged.list_id = parseInt(toListId);
    updatedCards.splice(destination.index, 0, dragged);
    updatedCards = updatedCards.map((card, index) => ({ ...card, position: index }));
    setData({ ...data, cards: updatedCards });
    await axios.put(`${API}/cards/reorder`, {
      cards: updatedCards, boardId, userId: user.id,
      movedCard: dragged, fromList: fromListId, toList: toListId,
    });
  };

  const createList = async () => {
    if (!newList.trim()) return;
    await axios.post(`${API}/lists`, { title: newList.trim(), board_id: boardId || 1, userId: user.id });
    setNewList(""); setShowAddList(false);
    fetchBoard(); toast.success('List created!');
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    try {
      await axios.delete(`${API}/lists/${id}`, { data: { boardId, userId: user.id } });
      fetchBoard(); toast.error('List deleted');
    } catch { toast.error("Failed to delete list"); }
  };

  const createCard = async (listId) => {
    const title = cardInputs[listId];
    if (!title || !title.trim()) return;
    const t = TAGS[tagIndex % TAGS.length]; tagIndex++;
    await axios.post(`${API}/cards`, {
      title: title.trim(), list_id: listId,
      tag: t.tag, tag_label: t.label,
      boardId, userId: user.id
    });
    setCardInputs({ ...cardInputs, [listId]: "" });
    setAddingCard(null); fetchBoard(); toast.success('Card created!');
  };

  const updateListTitle = async (id) => {
    if (!editListTitle.trim()) return;
    await axios.put(`${API}/lists/${id}`, { title: editListTitle.trim(), boardId, userId: user.id });
    setEditingList(null); fetchBoard(); toast.success('List updated!');
  };

  const updateCardTitle = async (id) => {
    if (!editCardTitle.trim()) return;
    await axios.put(`${API}/cards/${id}/title`, { title: editCardTitle.trim(), boardId, userId: user.id });
    setEditingCard(null); fetchBoard();
  };

  const updateCard = async () => {
    if (!modalTitle.trim()) return;
    await axios.put(`${API}/cards/${selectedCard.id}/title`, { title: modalTitle.trim(), boardId, userId: user.id });
    await axios.put(`${API}/cards/${selectedCard.id}/description`, { description: modalDesc, boardId, userId: user.id });
    await axios.put(`${API}/cards/${selectedCard.id}/meta`, {
      priority: modalPriority, status: modalStatus, labels: modalLabels,
      boardId, userId: user.id
    });
    await axios.put(`${API}/cards/${selectedCard.id}/due-date`, {
      due_date: modalDueDate ? new Date(modalDueDate).toISOString() : null,
      boardId, userId: user.id
    });
    setSelectedCard(null); fetchBoard(); toast.success('Card updated!');
  };

  const deleteCard = async (id) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await axios.delete(`${API}/cards/${id}`, { data: { boardId, userId: user.id } });
      fetchBoard(); toast.error('Card deleted');
    } catch { toast.error("Failed to delete card"); }
  };

  const openCardModal = (card) => {
    setSelectedCard(card);
    setModalTitle(card.title);
    setModalDesc(card.description || '');
    setModalPriority(card.priority || 'medium');
    setModalStatus(card.status || 'todo');
    setModalLabels(card.labels || []);
    setModalDueDate(toDatetimeLocal(card.due_date));
    setLabelInput('');
  };

  const addLabel = () => {
    const val = labelInput.trim().toLowerCase();
    if (!val || modalLabels.includes(val)) return;
    setModalLabels([...modalLabels, val]);
    setLabelInput('');
  };
  const removeLabel = (label) => setModalLabels(modalLabels.filter(l => l !== label));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); setShowBoard(false);
  };

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;
  if (!showBoard) return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "'Segoe UI', sans-serif", fontSize: 13, fontWeight: 600 } }} />
      <Dashboard user={user} onOpenBoard={() => setShowBoard(true)} onLogout={handleLogout} />
    </>
  );

  const avatarLetter = user.username ? user.username[0].toUpperCase() : '?';

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "'Segoe UI', sans-serif", fontSize: 13, fontWeight: 600 } }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'url("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80") center/cover no-repeat' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.1)' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 24px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setShowBoard(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginRight: 14, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >← Dashboard</button>

          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontFamily: "'Georgia', serif" }}>TaskFlow</span>

          <div style={{ marginLeft: 14, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3px 10px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600 }}>Live</span>
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotificationBell userId={user.id} />
            <button onClick={() => setShowActivity(true)}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >📋 Activity</button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0 }}>{avatarLetter}</div>
            <button onClick={handleLogout}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >Logout</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 24px 4px', color: '#fff', fontSize: 20, fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          Welcome back, {user.username}! ✨
        </div>

        {/* ── NEW: FilterBar ── */}
        {!loading && (
          <FilterBar
            allCards={data.cards}
            onFilteredChange={(ids, count, active) => {
              setMatchedCardIds(ids);
              setMatchCount(count);
              setFiltersActive(active);
            }}
          />
        )}
        {filtersActive && (
          <div style={{ textAlign: 'center', color: '#fff', fontSize: 12, marginBottom: 8, opacity: 0.85 }}>
            {matchCount} card{matchCount !== 1 ? 's' : ''} match
          </div>
        )}

        {/* Lists */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80, color: '#fff', fontSize: 14 }}>Loading board...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 14, padding: '14px 24px 32px', alignItems: 'flex-start', overflowX: 'auto', minHeight: 'calc(100vh - 170px)' }}>

              {data.lists.map(list => {
                const listCards = data.cards.filter(c => c.list_id === list.id);
                return (
                  <div key={list.id} style={{ background: 'rgba(255,255,255,0.94)', borderRadius: 14, width: 280, minWidth: 264, flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 210px)', transition: 'box-shadow 0.2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.26)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'}
                  >
                    {/* List Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 8px', borderBottom: '1px solid #ece9e0', flexShrink: 0 }}>
                      {editingList === list.id ? (
                        <input autoFocus value={editListTitle} onChange={e => setEditListTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') updateListTitle(list.id); if (e.key === 'Escape') setEditingList(null); }}
                          onBlur={() => updateListTitle(list.id)}
                          style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', border: '1px solid #2563eb', borderRadius: 5, padding: '2px 6px', outline: 'none', width: '140px' }}
                        />
                      ) : (
                        <EditableTitle value={list.title} isList onDoubleClick={() => { setEditingList(list.id); setEditListTitle(list.title); }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#78716c', background: '#e7e5df', borderRadius: 20, padding: '1px 8px' }}>{listCards.length}</span>
                        <TrashButton onClick={() => deleteList(list.id)} />
                      </div>
                    </div>

                    {/* Cards */}
                    <Droppable droppableId={list.id.toString()}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}
                          style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '8px 10px', overflowY: 'auto', flex: 1, minHeight: 40, scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
                        >
                          {listCards.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: 6, border: '1.5px dashed #e5e7eb', borderRadius: 9 }}>
                              <span style={{ fontSize: 22 }}>📋</span>
                              <p style={{ fontSize: 12, color: '#a8a29e', margin: 0, fontWeight: 700 }}>No cards yet</p>
                            </div>
                          )}
                          {listCards.map((card, index) => {
                            const tagStyle = TAG_STYLES[card.tag] || TAG_STYLES['tag-blue'];
                            const tagLabel = card.tag_label || TAGS[card.id % TAGS.length].label;
                            const isHovered = hoveredCard === card.id;
                            const priority = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.medium;
                            const status = STATUS_CONFIG[card.status] || STATUS_CONFIG.todo;
                            const overdue = isOverdue(card.due_date, card.status);
                            const dueSoon = isDueSoon(card.due_date, card.status);
                            // ── NEW: dim if filters active and card doesn't match ──
                            const dimmed = filtersActive && matchedCardIds && !matchedCardIds.has(card.id);
                            return (
                              <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                    onMouseEnter={() => setHoveredCard(card.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                      background: '#fff', borderRadius: 9, padding: '10px 12px',
                                      border: `1px solid ${overdue ? '#fca5a5' : snapshot.isDragging ? '#2563eb' : '#ece9e0'}`,
                                      cursor: 'grab',
                                      boxShadow: snapshot.isDragging ? '0 10px 28px rgba(0,0,0,0.22)' : isHovered ? '0 4px 14px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.07)',
                                      transform: snapshot.isDragging ? undefined : isHovered ? 'translateY(-2px)' : 'translateY(0)',
                                      transition: 'box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
                                      opacity: dimmed ? 0.25 : 1,  // ← NEW
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                      <div style={{ flex: 1 }}>
                                        {editingCard === card.id ? (
                                          <input autoFocus value={editCardTitle} onChange={e => setEditCardTitle(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') updateCardTitle(card.id); if (e.key === 'Escape') setEditingCard(null); }}
                                            onBlur={() => updateCardTitle(card.id)}
                                            style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', border: '1px solid #2563eb', borderRadius: 5, padding: '2px 6px', outline: 'none', width: '100%' }}
                                          />
                                        ) : (
                                          <div onClick={() => openCardModal(card)}
                                            style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', lineHeight: 1.4, cursor: 'pointer' }}
                                            title="Click to edit"
                                          >
                                            {card.title}
                                            {card.description && (
                                              <span style={{ display: 'block', fontSize: 11, color: '#a8a29e', marginTop: 3, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                📝 {card.description}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div title={`Priority: ${priority.label}`} style={{ width: 10, height: 10, borderRadius: '50%', background: priority.dot, flexShrink: 0, marginLeft: 8, marginTop: 3 }} />
                                    </div>

                                    {card.due_date && (
                                      <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                                        marginBottom: 6,
                                        background: overdue ? '#fee2e2' : dueSoon ? '#fef3c7' : '#f3f4f6',
                                        color: overdue ? '#dc2626' : dueSoon ? '#d97706' : '#6b7280',
                                      }}>
                                        {overdue ? '⏰ Overdue' : dueSoon ? '⏳' : '📅'} {formatDueDate(card.due_date)}
                                      </div>
                                    )}

                                    {card.labels && card.labels.length > 0 && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                                        {card.labels.map(label => (
                                          <span key={label} style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
                                            #{label}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 5, ...tagStyle }}>{tagLabel}</span>
                                        {card.status && card.status !== 'todo' && (
                                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: status.bg, color: status.color }}>
                                            {status.label}
                                          </span>
                                        )}
                                      </div>
                                      <TrashButton onClick={() => deleteCard(card.id)} />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {/* Add Card */}
                    <div style={{ padding: '6px 10px 10px', flexShrink: 0 }}>
                      {addingCard === list.id ? (
                        <>
                          <input autoFocus value={cardInputs[list.id] || ""}
                            onChange={e => setCardInputs({ ...cardInputs, [list.id]: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter') createCard(list.id); if (e.key === 'Escape') setAddingCard(null); }}
                            placeholder="Card title..."
                            style={{ width: '100%', color: '#1c1917', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button onClick={() => createCard(list.id)} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add card</button>
                            <button onClick={() => setAddingCard(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', fontSize: 18, cursor: 'pointer', padding: '4px 6px', borderRadius: 4 }}>✕</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setAddingCard(list.id)}
                          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: '1.5px dashed #d1d5db', color: '#9ca3af', fontSize: 12, fontFamily: 'inherit', padding: '7px 10px', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, transition: 'all 0.2s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ fontSize: 15, fontWeight: 700 }}>+</span> Add a Card
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add List */}
              <div style={{ width: 264, minWidth: 264, flexShrink: 0, alignSelf: 'flex-start' }}>
                {showAddList ? (
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <input autoFocus value={newList} onChange={e => setNewList(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') setShowAddList(false); }}
                      placeholder="List title..."
                      style={{ width: '100%', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 7, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', marginBottom: 8, background: 'rgba(255,255,255,0.95)', outline: 'none', boxSizing: 'border-box', color: '#1c1917' }}
                    />
                    <button onClick={createList} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginRight: 8, fontFamily: 'inherit' }}>Add list</button>
                    <button onClick={() => setShowAddList(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 18, cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddList(true)}
                    style={{ width: '100%', background: 'transparent', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: 12, padding: '9px 16px', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  >
                    <span style={{ fontSize: 17 }}>+</span> Add another list
                  </button>
                )}
              </div>
            </div>
          </DragDropContext>
        )}

        {/* ── Card Modal ── */}
        {selectedCard && (
          <div onClick={() => setSelectedCard(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          >
            <div onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 24px', width: 520, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#78716c' }}>✏️ Edit Card</span>
                <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#a8a29e' }}>✕</button>
              </div>

              <label style={labelStyle}>TITLE</label>
              <input value={modalTitle} onChange={e => setModalTitle(e.target.value)}
                style={{ ...inputStyle, marginBottom: 16, fontSize: 15, fontWeight: 600 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>PRIORITY</label>
                  <select value={modalPriority} onChange={e => setModalPriority(e.target.value)} style={selectStyle}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="high">🟡 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>STATUS</label>
                  <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} style={selectStyle}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <label style={labelStyle}>DUE DATE</label>
              <input
                type="datetime-local"
                value={modalDueDate}
                onChange={e => setModalDueDate(e.target.value)}
                style={{ ...inputStyle, marginBottom: 16 }}
              />

              <label style={labelStyle}>LABELS</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
                  placeholder="Type label + Enter (e.g. frontend)"
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
                <button onClick={addLabel} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
              {modalLabels.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {modalLabels.map(label => (
                    <span key={label} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#f3f4f6', color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                      #{label}
                      <button onClick={() => removeLabel(label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <label style={labelStyle}>DESCRIPTION</label>
              <textarea value={modalDesc} onChange={e => setModalDesc(e.target.value)}
                placeholder="Add a description..." rows={4}
                style={{ ...inputStyle, resize: 'vertical', marginBottom: 20 }}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={updateCard} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                <button onClick={() => setSelectedCard(null)} style={{ background: '#f5f5f4', color: '#78716c', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ActivityFeed boardId={boardId} isOpen={showActivity} onClose={() => setShowActivity(false)} socket={socket} />
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: '#9ca3af',
  display: 'block', marginBottom: 6, letterSpacing: '0.05em'
};
const inputStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '10px 12px', fontSize: 13, fontFamily: 'inherit',
  color: '#1c1917', outline: 'none', boxSizing: 'border-box',
};
const selectStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, fontFamily: 'inherit',
  color: '#1c1917', outline: 'none', background: '#fff', cursor: 'pointer',
};

export default App;
