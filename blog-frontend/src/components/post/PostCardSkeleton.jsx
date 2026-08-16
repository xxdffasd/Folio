// Mirrors PostCard's structure exactly (image block, chip, title lines,
// excerpt lines, byline row) so the grid doesn't visibly reflow the instant
// real data replaces the skeletons.
const PostCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="aspect-video w-full animate-pulse bg-stone-200" />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-4 w-16 animate-pulse rounded-full bg-stone-200" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />

        <div className="mt-2 flex items-center gap-2.5 border-t border-stone-100 pt-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
