import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API = "https://trello-backend-i0lq.onrender.com/api";

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

let tagIndex = 0;

function App() {
  const [data, setData] = useState({ lists: [], cards: [] });
  const [newList, setNewList] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [cardInputs, setCardInputs] = useState({});
  const [addingCard, setAddingCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API}/board/1`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch board", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
    let updatedCards = [...data.cards];
    const dragged = updatedCards.find(c => c.id === parseInt(draggableId));
    updatedCards = updatedCards.filter(c => c.id !== dragged.id);
    dragged.list_id = parseInt(destination.droppableId);
    updatedCards.splice(destination.index, 0, dragged);
    updatedCards = updatedCards.map((card, index) => ({ ...card, position: index }));
    setData({ ...data, cards: updatedCards });
         await axios.put(`${API}/cards/reorder`, { cards: updatedCards });
  };

  const createList = async () => {
    if (!newList.trim()) return;
    await axios.post(`${API}/lists`, { title: newList.trim(), board_id: 1 });
    setNewList("");
    setShowAddList(false);
    fetchBoard();
  };

  const deleteList = async (id) => {
    await axios.delete(`${API}/lists/${id}`);
    fetchBoard();
  };

  const createCard = async (listId) => {
    const title = cardInputs[listId];
    if (!title || !title.trim()) return;
    const t = TAGS[tagIndex % TAGS.length];
    tagIndex++;
    await axios.post(`${API}/cards`, { title: title.trim(), list_id: listId, tag: t.tag, tag_label: t.label });
    setCardInputs({ ...cardInputs, [listId]: "" });
    setAddingCard(null);
    fetchBoard();
  };

  const deleteCard = async (id) => {
    await axios.delete(`${API}/cards/${id}`);
    fetchBoard();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'url("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80") center/cover no-repeat fixed',
      fontFamily: "'Segoe UI', -apple-system, sans-serif"
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '12px 24px',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
    <span style={{
  fontSize: 28,
  fontWeight: 900,
  color: '#fff',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: 'none',
  fontStyle: 'italic',
  
  fontFamily: "'Georgia', serif"
}}>
  Trello
</span>
      </div>

      {/* ── Board Title ── */}
      <div style={{
        padding: '16px 24px 4px',
        color: '#fff',
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: '-0.4px',
        textShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        My Board
      </div>

      {/* ── Lists ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80, color: '#fff', fontSize: 14 }}>
          Loading board...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14,
            padding: '16px 24px 32px',
            alignItems: 'flex-start'
          }}>

            {data.lists.map(list => {
              const listCards = data.cards.filter(c => c.list_id === list.id);
              return (
                <div key={list.id} style={{
                  background: 'rgba(255,255,255,0.93)',
                  borderRadius: 14,
                  width: 260,
                  minWidth: 260,
                  padding: '12px 10px 10px',
                  flexShrink: 0,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.18)'
                }}>

                  {/* List Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 4px 10px',
                    borderBottom: '1px solid #ece9e0'
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1c1917' }}>
                      {list.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#78716c',
                        background: '#e7e5df', borderRadius: 20,
                        padding: '1px 8px'
                      }}>
                        {listCards.length}
                      </span>
                      <button onClick={() => deleteList(list.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#a8a29e', fontSize: 13, padding: '2px 4px', borderRadius: 4
                      }}>✕</button>
                    </div>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={list.id.toString()}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ display: 'flex', flexDirection: 'column', gap: 7, minHeight: 8, paddingTop: 8 }}
                      >
                        {listCards.length === 0 && (
                          <p style={{ fontSize: 12, color: '#a8a29e', textAlign: 'center', padding: '10px 0', margin: 0 }}>
                            No cards yet
                          </p>
                        )}
                        {listCards.map((card, index) => {
                          const tagStyle = TAG_STYLES[card.tag] || TAG_STYLES['tag-blue'];
                          return (
                            <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    background: '#fff',
                                    borderRadius: 9,
                                    padding: '12px 14px',
                                    border: '1px solid #ece9e0',
                                    cursor: 'grab',
                                    boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.07)',
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  {/* Card title - bold and visible */}
                                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', lineHeight: 1.4 }}>
                                    {card.title}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                                    <span style={{
                                      fontSize: 11, fontWeight: 600,
                                      padding: '2px 9px', borderRadius: 5,
                                      ...tagStyle
                                    }}>
                                      {card.tag_label || 'Task'}
                                    </span>
                                    <button onClick={() => deleteCard(card.id)} style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: '#c4b5b0', fontSize: 12, padding: '2px 4px'
                                    }}>✕</button>
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
                  <div style={{ marginTop: 8 }}>
                    {addingCard === list.id ? (
                      <>
                        <input
                          autoFocus
                          value={cardInputs[list.id] || ""}
                          onChange={e => setCardInputs({ ...cardInputs, [list.id]: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') createCard(list.id);
                            if (e.key === 'Escape') setAddingCard(null);
                          }}
                          placeholder="Card title..."
                          style={{
                            color: '#1c1917', fontSize: 13, fontFamily: 'inherit',
fontWeight: 600,
padding: '6px 4px', cursor: 'pointer', borderRadius: 6,
display: 'flex', alignItems: 'center', gap: 6
                          }}
                        />
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button onClick={() => createCard(list.id)} style={{
                            flex: 1, background: '#2563eb', color: '#fff', border: 'none',
                            borderRadius: 7, padding: '7px 10px', fontSize: 12,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                          }}>Add card</button>
                          <button onClick={() => setAddingCard(null)} style={{
                            background: 'none', border: 'none', color: '#a8a29e',
                            fontSize: 18, cursor: 'pointer', padding: '4px 6px', borderRadius: 4
                          }}>✕</button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setAddingCard(list.id)}
                        onMouseEnter={e => e.currentTarget.style.background = '#ece9e0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        style={{
                          width: '100%', textAlign: 'left', background: 'none', border: 'none',
                          color: '#78716c', fontSize: 13, fontFamily: 'inherit',
                          padding: '6px 4px', cursor: 'pointer', borderRadius: 6,
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <span style={{ fontSize: 16, fontWeight: 700 }}>+</span> <b>Add a Card</b>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {/* ── Add List — sits after the columns ── */}
            <div style={{ width: 260, minWidth: 260, flexShrink: 0, alignSelf: 'flex-start' }}>
              {showAddList ? (
                <div style={{
                  background: 'rgba(255,255,255,0.2)', borderRadius: 14,
                  padding: 12, backdropFilter: 'blur(6px)'
                }}>
                  <input
                    autoFocus
                    value={newList}
                    onChange={e => setNewList(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') setShowAddList(false); }}
                    placeholder="List title..."
                    style={{
                      width: '100%', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 7,
                      padding: '7px 10px', fontSize: 13, fontFamily: 'inherit',
                      marginBottom: 8, background: 'rgba(255,255,255,0.95)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <button onClick={createList} style={{
                    background: '#fff', color: '#1a6b4a', border: 'none', borderRadius: 7,
                    padding: '6px 16px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', marginRight: 8, fontFamily: 'inherit'
                  }}>Add list</button>
                  <button onClick={() => setShowAddList(false)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
                    fontSize: 18, cursor: 'pointer'
                  }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.18)', border: 'none',
                    borderRadius: 12, padding: '11px 16px', cursor: 'pointer',
                    color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 8,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>+</span> Add another list
                </button>
              )}
            </div>

          </div>
        </DragDropContext>
      )}
    </div>
  );
}

export default App;