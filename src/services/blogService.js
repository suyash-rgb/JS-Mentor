import api from './api';

/**
 * Fetch all published blogs.
 */
export const fetchBlogs = async () => {
  try {
    const response = await api.get('/api/v1/blogs/');
    return response.data;
  } catch (error) {
    console.error('blogService: Failed to fetch blogs', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch blogs');
  }
};

/**
 * Add a new blog post (trainer only).
 */
export const addBlog = async (blogData) => {
  try {
    const response = await api.post('/api/v1/blogs/', blogData);
    return response.data;
  } catch (error) {
    console.error('blogService: Failed to add blog', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to add blog');
  }
};

/**
 * Delete a blog post by ID (trainer only).
 */
export const deleteBlog = async (id) => {
  try {
    const response = await api.delete(`/api/v1/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`blogService: Failed to delete blog ${id}`, error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to delete blog');
  }
};

const blogService = {
  fetchBlogs,
  addBlog,
  deleteBlog,
};

export default blogService;
