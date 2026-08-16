import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // The editor's CSS theme
import axiosInstance from '../api/axiosConfig'; // Adjust path if your axios instance is located elsewhere

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Convert comma-separated tags into an array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      // 2. Generate a URL-friendly slug from the title
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
        .replace(/(^-|-$)+/g, '');   // Clean up any hyphens at the very beginning or end
      
      // 3. Add the slug to the payload!
      const payload = {
        title,
        slug: generatedSlug, // <--- Here is what Zod was asking for!
        coverImage,
        content,
        tags: tagsArray,
        status,
      };

      // Send to your Node.js backend
      await axiosInstance.post('/posts', payload);
      
      // On success, go back to the home page to see the new post!
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Write a Story</h1>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            placeholder="Give your post a title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            required
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <div className="bg-white">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              className="h-64 mb-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
              placeholder="tech, coding, javascript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Public)</option>
            </select>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;