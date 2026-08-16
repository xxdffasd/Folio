import axiosInstance from './axiosConfig.js';
// ---- Posts ----

export const fetchPosts = async ({ page = 1, limit = 9, tag, search } = {}) => {
  const { data } = await axiosInstance.get('/posts', { params: { page, limit, tag, search } });
  return data.data; // { posts, pagination }
};

export const fetchPostBySlug = async (slug) => {
  const { data } = await axiosInstance.get(`/posts/slug/${slug}`);
  return data.data.post;
};

export const toggleLikePost = async (postId) => {
  const { data } = await axiosInstance.patch(`/posts/${postId}/like`);
  return data.data; // { liked, likeCount }
};

// ---- Comments ----

export const fetchPostComments = async (postId) => {
  const { data } = await axiosInstance.get(`/posts/${postId}/comments`);
  return data.data.comments;
};

export const addPostComment = async (postId, content) => {
  const { data } = await axiosInstance.post(`/posts/${postId}/comments`, { content });
  return data.data.comment;
};

export const deletePostComment = async (postId, commentId) => {
  await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
};
