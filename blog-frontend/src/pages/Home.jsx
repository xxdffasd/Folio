import { useState, useEffect } from 'react';
import { fetchPosts } from '../api/postApi.js';
import PostCard from '../components/post/PostCard.jsx';
import PostCardSkeleton from '../components/post/PostCardSkeleton.jsx';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const { posts } = await fetchPosts({ page: 1, limit: 9 });
        if (!cancelled) setPosts(posts);
      } catch (err) {
        if (!cancelled) setError('Something went wrong loading the feed. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Masthead */}
      <div className="mb-14 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-700">The Folio Journal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">
          Stories worth reading
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-500">
          Essays, field notes, and ideas from writers who take their craft seriously.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}

        {!loading && posts.length === 0 && !error && (
          <p className="col-span-full py-16 text-center text-stone-400">
            No stories published yet — check back soon.
          </p>
        )}

        {!loading && posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </div>
  );
};

export default Home;
