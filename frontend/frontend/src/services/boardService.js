import API from "./api";

export const getBoards = async (userId) => {
  const res = await API.get(`/users/${userId}/boards`);
  return res.data;
};

export const createBoard = async (title, userId) => {
  const res = await API.post("/boards", {
    title,
    userId,
  });

  return res.data;
};

export const deleteBoard = async (boardId) => {
  await API.delete(`/boards/${boardId}`);
};

export const renameBoard = async (boardId, title) => {
  const res = await API.put(`/boards/${boardId}`, {
    title,
  });

  return res.data;
};