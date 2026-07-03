import { useEffect, useState } from "react";
import API from "../services/api";

export default function useBoard(user, showBoard) {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    board: null,
    lists: [],
    cards: [],
  });

  const fetchBoard = async (boardId) => {
    if (!boardId) return;

    try {
      setLoading(true);

      const res = await API.get(`/board/${boardId}`);

      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch board", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !showBoard || !data.board?.id) return;

    fetchBoard(data.board.id);
  }, [user, showBoard]);

  return {
    data,
    setData,
    loading,
    setLoading,
    fetchBoard,
  };
}