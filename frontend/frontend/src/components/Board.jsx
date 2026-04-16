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
    <div className="p-5 bg-blue-100 min-h-screen flex gap-4">
      {lists.map((list) => (
        <List key={list.id} list={list} cards={cards} />
      ))}
    </div>
  );
}

export default Board;