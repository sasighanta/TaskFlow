import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import BoardTopBar from "./components/board/BoardTopBar";
import BoardStats from "./components/board/BoardStats";
import BoardToolbar from "./components/board/BoardToolbar";
import ListColumn from "./components/list/ListColumn";

function Board() {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    const res = await axios.get("http://localhost:5000/api/board/1");

    setLists(res.data.lists);
    setCards(res.data.cards);
  };

  const filteredCards = useMemo(() => {
    return cards.filter((card) =>
      card.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [cards, search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e293b,#111827)",
        padding: 35,
      }}
    >
      <BoardTopBar
        boardTitle="My Project"
        onBack={() => {}}
        onInvite={() => {}}
        onSettings={() => {}}
      />

      <BoardStats
        totalLists={lists.length}
        totalCards={cards.length}
        completed={
          filteredCards.filter((c) => c.status === "done").length
        }
      />

      <BoardToolbar
        onSearch={setSearch}
        onAddTask={() => {}}
      />

      <div
        style={{
          display: "flex",
          gap: 22,
          overflowX: "auto",
          alignItems: "flex-start",
        }}
      >
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            cards={filteredCards}
          />
        ))}
      </div>
    </div>
  );
}

export default Board;