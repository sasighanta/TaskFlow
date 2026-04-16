import { useEffect, useState } from "react";
import axios from "axios";
import List from "./List";

function Board() {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    const res = await axios.get("http://localhost:5000/api/board/1");
    setLists(res.data.lists);
    setCards(res.data.cards);
  };

  return (
    <div className="board-bg min-h-screen">
      {/* Header */}
      <div className="board-header">
        <span className="board-title">My Workspace</span>
      </div>

      {/* Lists */}
      <div className="flex gap-5 p-6 overflow-x-auto items-start">
        {lists.map((list) => (
          <List key={list.id} list={list} cards={cards} />
        ))}

        {/* Add another list button */}
        <button className="add-list-btn">+ Add another list</button>
      </div>
    </div>
  );
}

export default Board;