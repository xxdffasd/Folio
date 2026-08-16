import { Link } from 'react-router-dom';
import { formatPostDate, stripHtml } from '../../utils/format.js';

// The one visual signature shared between the feed card and the single-post
// hero: a small uppercase "kicker" tag chip + a byline row (avatar, name,
// middot, date). Repeating it in both places is what makes the two views
// feel like one designed product instead of two unrelated screens.
const PostCard = ({ post }) => {
  const excerpt = stripHtml(post.content).slice(0, 140);
  const primaryTag = post.tags?.[0];

  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-stone-300"
    >
      <div className="aspect-video w-full overflow-hidden bg-stone-100">
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {primaryTag && (
          <span className="w-fit rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-800">
            {primaryTag}
          </span>
        )}

        <h3 className="font-display text-xl font-semibold leading-snug text-stone-900 line-clamp-2">
          {post.title}
        </h3>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">{excerpt}</p>

        <div className="mt-2 flex items-center gap-2.5 border-t border-stone-100 pt-4">
          {/* FIXED: UI-Avatars Fallback applied here */}
          <img
  src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=random`}
  alt={post.author?.name || 'Author'}
  className="h-8 w-8 rounded-full object-cover ring-1 ring-stone-200"
  onError={(e) => {
    // If the image link is broken, this forces it to swap to the initials!
    e.target.src = `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=random`;
  }}
/>
          <span className="text-sm font-medium text-stone-700">{post.author?.name}</span>
          <span className="text-stone-300">&middot;</span>
          <span className="text-sm text-stone-500">{formatPostDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;