import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { fetchPostBySlug } from '../api/postApi.js';
import { formatPostDate } from '../utils/format.js';
import LikeButton from '../components/post/LikeButton.jsx';
import CommentSection from '../components/post/CommentSection.jsx';

const HeroSkeleton = () => (
  <div className="mx-auto max-w-3xl animate-pulse px-4 pt-16 text-center">
    <div className="mx-auto h-4 w-24 rounded-full bg-stone-200" />
    <div className="mx-auto mt-5 h-10 w-full rounded bg-stone-200" />
    <div className="mx-auto mt-3 h-10 w-3/4 rounded bg-stone-200" />
    <div className="mx-auto mt-8 h-9 w-56 rounded-full bg-stone-200" />
    <div className="mx-auto mt-10 aspect-[21/9] w-full max-w-5xl rounded-3xl bg-stone-200" />
  </div>
);

const SinglePost = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPostBySlug(slug);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? 'This story could not be found.'
              : 'Something went wrong loading this story.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <HeroSkeleton />;

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-lg text-stone-600">{error || 'Story not found.'}</p>
        <Link to="/" className="mt-4 inline-block font-medium text-accent-700 underline">
          Back to the feed
        </Link>
      </div>
    );
  }

  const primaryTag = post.tags?.[0];

  return (
    <article>
      {/* ---------------- Hero ---------------- */}
      <header className="mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6">
        {primaryTag && (
          <span className="inline-block rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-800">
            {primaryTag}
          </span>
        )}

        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl md:text-6xl">
          {post.title}
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-stone-500">
          <img
            src={post.author?.avatar}
            alt={post.author?.name}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-stone-200"
          />
          <span className="text-sm font-medium text-stone-800">{post.author?.name}</span>
          <span className="text-stone-300">&middot;</span>
          <span className="text-sm">{formatPostDate(post.createdAt)}</span>
          <span className="text-stone-300">&middot;</span>
          <span className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} min read
          </span>
        </div>
      </header>

      {/* ---------------- Cover image ---------------- */}
      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
        <img
          src={post.coverImage}
          alt={post.title}
          className="aspect-[21/9] w-full rounded-3xl object-cover shadow-lg shadow-stone-200"
        />
      </div>

      {/* ---------------- Content ---------------- */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div
          className="prose prose-lg prose-stone max-w-none mx-auto prose-headings:font-display prose-a:text-accent-700 prose-blockquote:border-accent-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-10 flex items-center justify-between border-t border-stone-200 pt-8">
          <LikeButton post={post} />
        </div>

        <CommentSection post={post} />
      </div>
    </article>
  );
};

export default SinglePost;
