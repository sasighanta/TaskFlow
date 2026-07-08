import API from "./api";

// Get all comments for a card
export const getComments = async (cardId) => {
  const res = await API.get(`/cards/${cardId}/comments`);
  return res.data;
};

// Add a comment
export const addComment = async (cardId, userId, comment) => {
  const res = await API.post(`/cards/${cardId}/comments`, {
    userId,
    comment,
  });

  return res.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  await API.delete(`/comments/${commentId}`);
};