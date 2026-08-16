import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { toggleLikePost } from '../../api/postApi.js';

const LikeButton = ({ post }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(() => Boolean(user && post.likes?.includes(user._id)));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/posts/${post.slug}` } } });
      return;
    }

    // Optimistic update — flip the UI immediately, roll back only if the
    // request fails, so liking feels instant rather than waiting on a round-trip.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
    setPending(true);

    try {
      const result = await toggleLikePost(post._id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      // Roll back on failure
      setLiked(!nextLiked);
      setLikeCount((count) => count - (nextLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors
        ${
          liked
            ? 'border-rose-200 bg-rose-50 text-rose-600'
            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
        }`}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-rose-600' : ''}`} />
      {likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'Like' : 'Likes'}
    </button>
  );
};

export default LikeButton;
