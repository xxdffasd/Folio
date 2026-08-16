import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { fetchPostComments, addPostComment, deletePostComment } from '../../api/postApi.js';
import { formatPostDate } from '../../utils/format.js';

const CommentSection = ({ post }) => {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPostComments(post._id);
        setComments(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [post._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const comment = await addPostComment(post._id, content.trim());
      setComments((prev) => [comment, ...prev]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    await deletePostComment(post._id, commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  // A comment is deletable by its own author OR by the post's author
  // (moderation rights over their own post) — mirrors the backend's rule exactly.
  const canDelete = (comment) =>
    isAuthenticated && (comment.author?._id === user._id || post.author?._id === user._id);

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
      <h2 className="font-display text-2xl font-semibold text-stone-900">
        Comments {comments.length > 0 && <span className="text-stone-400">({comments.length})</span>}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-stone-200 p-3 text-sm focus:border-accent-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-fit rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {submitting ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <Link to="/login" className="font-medium text-accent-700 underline">
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-6">
        {loading && <p className="text-sm text-stone-400">Loading comments...</p>}

        {!loading && comments.length === 0 && (
          <p className="text-sm text-stone-400">No comments yet — be the first to share your thoughts.</p>
        )}

        {comments.map((comment) => (
          <li key={comment._id} className="flex gap-3">
            <img
              src={comment.author?.avatar}
              alt={comment.author?.name}
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-1 ring-stone-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-900">{comment.author?.name}</span>
                <span className="text-xs text-stone-400">{formatPostDate(comment.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{comment.content}</p>
            </div>

            {canDelete(comment) && (
              <button
                onClick={() => handleDelete(comment._id)}
                title="Delete comment"
                className="h-fit text-stone-300 transition-colors hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CommentSection;
