const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true, // enforces uniqueness at the DB level and auto-creates an index used for direct /posts/:slug lookups
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)'],
    },
    content: {
      type: String, // sanitized HTML from the rich text editor
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String, // Cloudinary/S3 URL
      required: [true, 'Cover image is required'],
      match: [/^https?:\/\/.+/i, 'Cover image must be a valid URL'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up "posts by this author" queries (author profile pages)
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.toLowerCase().trim()),
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not a supported status',
      },
      default: 'draft',
    },
    readTime: {
      type: Number, // minutes, typically derived from content word count
      required: true,
      min: 1,
    },
    likes: {
      // Storing user ObjectIds (not just a count) lets us:
      //   1. Toggle correctly (check if a user already liked before push/pull)
      //   2. Show "liked by X, Y, and 12 others" style UI later if desired
      // For very high-traffic posts, a denormalized `likeCount` field updated
      // via $inc could reduce document size, but for a medium-complexity
      // blog, storing the array directly keeps toggling simple and atomic.
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * INDEXING STRATEGY
 * -----------------
 * 1. slug (unique index, defined above via `unique: true`):
 *    Every public post view hits GET /posts/:slug. A unique index turns that
 *    lookup into an O(log n) B-tree lookup instead of a collection scan, and
 *    it also guarantees no two posts can collide on the same URL segment.
 *
 * 2. status:
 *    The public blog only ever lists status: 'published' posts, while the
 *    author dashboard filters by status: 'draft'. Since status has extremely
 *    low cardinality (2 values) but is on almost every list query's filter,
 *    indexing it avoids scanning the full collection for the common case.
 *
 * 3. Compound index { status: 1, createdAt: -1 }:
 *    The most frequent real query is "give me published posts, newest first,
 *    paginated" — this compound index lets Mongo satisfy the filter AND the
 *    sort from the index directly (no in-memory sort stage), which matters
 *    a lot once the collection grows.
 *
 * 4. Text index on title/content/tags:
 *    Powers the "search box" requirement using MongoDB's built-in $text
 *    operator instead of scanning/regexing every document. Weighted so a
 *    match in the title ranks higher than a match buried in body content.
 */
postSchema.index({ status: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index(
  { title: 'text', content: 'text', tags: 'text' },
  { weights: { title: 5, tags: 3, content: 1 }, name: 'PostTextIndex' }
);

module.exports = mongoose.model('Post', postSchema);
