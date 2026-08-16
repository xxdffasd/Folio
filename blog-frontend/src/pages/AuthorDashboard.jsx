import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        // Fetching the user's posts. Adjust the endpoint if your backend uses a different route for author drafts/posts.
        const res = await axiosInstance.get('/posts'); 
        // Note: For a strict dashboard, you might want an endpoint like /posts/me to get both drafts and published posts.
        setPosts(res.data.posts || res.data);
      } catch (err) {
        setError('Failed to load your posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axiosInstance.delete(`/posts/${id}`);
      setPosts(posts.filter(post => post._id !== id));
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
        <Link to="/create-post" className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
          Write a Story
        </Link>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">{error}</div>}

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-10">You haven't written any posts yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post._id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <Link to={`/post/${post.slug}`} className="text-xl font-semibold text-gray-900 hover:underline">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {post.status}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;