import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API = "https://YOUR-BACKEND-URL.onrender.com/api";

const TAGS = [
  { tag: 'tag-blue', label: 'Design' },
  { tag: 'tag-green', label: 'Feature' },
  { tag: 'tag-amber', label: 'Backend' },
  { tag: 'tag-red', label: 'Bug' },
];

const TAG_STYLES = {
  'tag-blue':  { background: '#E6F1FB', color: '#185FA5' },
  'tag-green': { background: '#EAF3DE', color: '#3B6D11' },
  'tag-amber': { background: '#FAEEDA', color: '#854F0B' },
  'tag-red':   { background: '#FCEBEB', color: '#A32D2D' },
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

  const { source, destination, draggableId } = result;

  // Step 1: Copy cards
  let updatedCards = [...data.cards];

  // Step 2: Remove dragged card
  const dragged = updatedCards.find(c => c.id === parseInt(draggableId));
  updatedCards = updatedCards.filter(c => c.id !== dragged.id);

  // Step 3: Insert at new position
  dragged.list_id = parseInt(destination.droppableId);
  updatedCards.splice(destination.index, 0, dragged);

  // Step 4: Reassign positions
  updatedCards = updatedCards.map((card, index) => ({
    ...card,
    position: index
  }));

  // Step 5: Update UI instantly
  setData({ ...data, cards: updatedCards });

  // Step 6: Send ALL updated cards to backend
  await axios.put("http://localhost:5000/api/cards/reorder", {
    cards: updatedCards
  });
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
    await axios.post(`${API}/cards`, {
      title: title.trim(),
      list_id: listId,
      tag: t.tag,
      tag_label: t.label
    });
    setCardInputs({ ...cardInputs, [listId]: "" });
    setAddingCard(null);
    fetchBoard();
  };

  const deleteCard = async (id) => {
    await axios.delete(`${API}/cards/${id}`);
    fetchBoard();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a6b4a 0%, #1d5a8a 100%)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', background:'rgba(0,0,0,0.18)' }}>
        <span style={{ fontSize:20, fontWeight:600, color:'#fff', letterSpacing:'-0.3px' }}>
          My Workspace
        </span>
        <span style={{ fontSize:12, padding:'3px 12px', borderRadius:20, background:'rgba(255,255,255,0.18)', color:'#fff' }}>
          Board #1
        </span>
      </div>

      {/* Board */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', paddingTop:80, color:'rgba(255,255,255,0.8)', fontSize:15 }}>
          Loading board...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display:'flex', gap:12, padding:'16px 20px 24px', overflowX:'auto', alignItems:'flex-start' }}>

            {data.lists.map(list => {
              const listCards = data.cards.filter(c => c.list_id === list.id);
              return (
                <div key={list.id} style={{ background:'#F1EFE8', borderRadius:10, width:240, minWidth:240, padding:10, flexShrink:0 }}>

                  {/* List Header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, padding:'2px 4px' }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#2C2C2A' }}>{list.title}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:11, fontWeight:500, color:'#5F5E5A', background:'#D3D1C7', borderRadius:10, padding:'1px 7px' }}>
                        {listCards.length}
                      </span>
                      <button
                        onClick={() => deleteList(list.id)}
                        title="Delete list"
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#888780', fontSize:14, padding:'2px 5px', borderRadius:4 }}
                      >✕</button>
                    </div>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={list.id.toString()}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} style={{ display:'flex', flexDirection:'column', gap:6, minHeight:8 }}>
                        {listCards.length === 0 && (
                          <p style={{ fontSize:12, color:'#888780', textAlign:'center', padding:'10px 0' }}>No cards yet</p>
                        )}
                        {listCards.map((card, index) => {
                          const tagStyle = TAG_STYLES[card.tag] || TAG_STYLES['tag-blue'];
                          return (
                            <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="trello-card"
                                  style={{
                                    background:'#fff', borderRadius:7, padding:'10px 12px',
                                    border:'0.5px solid #D3D1C7', cursor:'grab',
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <div style={{ fontSize:13, color:'#2C2C2A', lineHeight:1.4 }}>{card.title}</div>
                                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                                    <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:4, ...tagStyle }}>
                                      {card.tag_label || 'Task'}
                                    </span>
                                    <button
                                      onClick={() => deleteCard(card.id)}
                                      style={{ background:'none', border:'none', cursor:'pointer', color:'#B4B2A9', fontSize:12, padding:'2px 4px' }}
                                    >✕</button>
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
                  <div style={{ marginTop:8 }}>
                    {addingCard === list.id ? (
                      <>
                        <input
                          autoFocus
                          value={cardInputs[list.id] || ""}
                          onChange={e => setCardInputs({ ...cardInputs, [list.id]: e.target.value })}
                          onKeyDown={e => { if(e.key === 'Enter') createCard(list.id); if(e.key === 'Escape') setAddingCard(null); }}
                          placeholder="Card title..."
                          style={{ width:'100%', border:'0.5px solid #D3D1C7', borderRadius:6, padding:'7px 10px', fontSize:13, outline:'none', fontFamily:'inherit' }}
                        />
                        <div style={{ display:'flex', gap:6, marginTop:6 }}>
                          <button
                            onClick={() => createCard(list.id)}
                            style={{ flex:1, background:'#185FA5', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}
                          >Add card</button>
                          <button
                            onClick={() => setAddingCard(null)}
                            style={{ background:'none', border:'none', color:'#888780', fontSize:18, cursor:'pointer', padding:'4px 6px', borderRadius:4 }}
                          >✕</button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setAddingCard(list.id)}
                        style={{ width:'100%', textAlign:'left', background:'none', border:'none', color:'#5F5E5A', fontSize:13, fontFamily:'inherit', padding:'6px 4px', cursor:'pointer', borderRadius:5, display:'flex', alignItems:'center', gap:6 }}
                      >
                        <span style={{ fontSize:16 }}>+</span> Add a card
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {/* Add List */}
            <div style={{ width:240, minWidth:240, flexShrink:0 }}>
              {showAddList ? (
                <div style={{ background:'rgba(255,255,255,0.18)', borderRadius:10, padding:10 }}>
                  <input
                    autoFocus
                    value={newList}
                    onChange={e => setNewList(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') createList(); if(e.key==='Escape') setShowAddList(false); }}
                    placeholder="List title..."
                    style={{ width:'100%', border:'0.5px solid rgba(255,255,255,0.4)', borderRadius:6, padding:'7px 10px', fontSize:13, fontFamily:'inherit', marginBottom:6, background:'rgba(255,255,255,0.9)', outline:'none' }}
                  />
                  <button onClick={createList} style={{ background:'#fff', color:'#1a6b4a', border:'none', borderRadius:6, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer', marginRight:6, fontFamily:'inherit' }}>
                    Add list
                  </button>
                  <button onClick={() => setShowAddList(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.8)', fontSize:18, cursor:'pointer' }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.14)', border:'none', borderRadius:10, padding:'10px 14px', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:500, fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}
                >
                  <span>+</span> Add another list
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