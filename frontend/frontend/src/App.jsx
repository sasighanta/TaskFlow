import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function App() {
  const [data, setData] = useState({ lists: [], cards: [] });
  const [newList, setNewList] = useState("");
  const [cardInputs, setCardInputs] = useState({});

  const fetchBoard = async () => {
    const res = await axios.get("http://localhost:5000/api/board/1");
    setData(res.data);
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  // ✅ Drag function
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;

    await axios.put(`http://localhost:5000/api/cards/${draggableId}`, {
      list_id: parseInt(destination.droppableId),
      position: destination.index
    });

    fetchBoard();
  };

  // ✅ Create list
  const createList = async () => {
    if (!newList) return;

    await axios.post("http://localhost:5000/api/lists", {
      title: newList,
      board_id: 1
    });

    setNewList("");
    fetchBoard();
  };

  // ✅ Create card
  const createCard = async (listId, title) => {
    if (!title) return;

    await axios.post("http://localhost:5000/api/cards", {
      title,
      list_id: listId
    });

    setCardInputs({
      ...cardInputs,
      [listId]: ""
    });

    fetchBoard();
  };

  // ✅ DELETE CARD FUNCTION
  const deleteCard = async (id) => {
    await axios.delete(`http://localhost:5000/api/cards/${id}`);
    fetchBoard();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trello Clone</h1>

      {/* ✅ Add List */}
      <div className="flex gap-2 mb-4">
        <input
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
          placeholder="New List"
          className="border p-2 rounded"
        />
        <button
          onClick={createList}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Add List
        </button>
      </div>

      {/* ✅ Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {data.lists.length === 0 && <p>No lists yet</p>}

          {data.lists.map(list => (
            <Droppable droppableId={list.id.toString()} key={list.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-200 p-3 w-64 rounded"
                >

                  <h2 className="font-bold">{list.title}</h2>

                  {/* ✅ Cards */}
                  {data.cards
                    .filter(c => c.list_id === list.id)
                    .map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 mt-2 rounded shadow"
                          >
                            {card.title}

                            {/* ✅ DELETE BUTTON */}
                            <button
                              onClick={() => deleteCard(card.id)}
                              className="text-red-500 text-sm mt-1"
                            >
                              Delete
                            </button>

                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                  {/* ✅ Add Card */}
                  <input
                    placeholder="New Card"
                    className="border p-2 mt-2 w-full"
                    value={cardInputs[list.id] || ""}
                    onChange={(e) =>
                      setCardInputs({
                        ...cardInputs,
                        [list.id]: e.target.value
                      })
                    }
                  />

                  <button
                    onClick={() => createCard(list.id, cardInputs[list.id])}
                    className="bg-green-500 text-white px-2 py-1 mt-2 rounded"
                  >
                    Add Card
                  </button>

                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>

    </div>
  );
}

export default App;