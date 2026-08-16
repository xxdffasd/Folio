const Post = require('../models/Post');

const WORDS_PER_MINUTE = 200;

/**
 * Computes reading time in whole minutes from an HTML content string.
 * - Strips HTML tags first so markup doesn't inflate the word count.
 * - Always rounds UP (ceil) and floors at 1, so a very short post never
 *   reports "0 min read".
 */
const calculateReadTime = (content = '') => {
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};

/**
 * POST /api/posts
 * Protected: authenticateUser + authorizeRoles('author')
 * Body already validated by validate(createPostSchema).
 */
const createPost = async (req, res) => {
  try {
    const { title, slug, content, coverImage, tags, status } = req.body;

    const readTime = calculateReadTime(content);

    const post = await Post.create({
      title,
      slug,
      content,
      coverImage,
      tags,
      status,
      readTime, // always server-computed — never trust a client-supplied value
      author: req.user._id, // req.user is set by authenticateUser (real DB user doc)
    });

    return res.status(201).json({ success: true, message: 'Post created successfully', data: { post } });
  } catch (err) {
    // slug has a unique index — a duplicate insert throws a Mongo E11000 error
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with this slug already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create post', error: err.message });
  }
};

/**
 * GET /api/posts
 * Public. Query already validated/coerced by validate(getPostsQuerySchema, 'query').
 * Supports: pagination (page, limit), filtering (tag), search (title), sort.
 */
const getPosts = async (req, res) => {
  try {
    const { page, limit, tag, search, sort } = req.query;

    // ----- Build the Mongo filter -----
    // This endpoint is public, so it only ever exposes published posts —
    // drafts are never reachable here regardless of what query params are sent.
    const filter = { status: 'published' };

    if (tag) {
      filter.tags = tag; // Mongo matches automatically if the `tags` array contains this value
    }

    if (search) {
      // Case-insensitive partial match on the post title, per spec.
      // Note: a leading-wildcard regex like this can't use the title text
      // index, so it's a collection scan under the hood. Fine at blog scale;
      // if the post volume grows large, swap this for the $text index
      // already defined on Post (title/content/tags) for indexed full-text search.
      filter.title = { $regex: search, $options: 'i' };
    }

    // ----- Pagination math -----
    // `page` and `limit` arrive as validated positive integers (defaults:
    // page=1, limit=10, capped at 100 by the Zod schema).
    //
    // `skip` = how many matching documents to jump over before collecting
    // results, i.e. "skip the previous pages' worth of documents".
    //   page 1, limit 10 -> skip 0   -> returns documents 1-10
    //   page 2, limit 10 -> skip 10  -> returns documents 11-20
    //   page 3, limit 10 -> skip 20  -> returns documents 21-30
    const skip = (page - 1) * limit;
    const sortOrder = sort === 'oldest' ? 1 : -1; // default: newest first

    // Fetch the page of results and the total matching count in parallel —
    // they're independent queries against the same filter, so there's no
    // need to wait for one before starting the other.
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar'), // expose only name + avatar, never email/password
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          totalPosts: total,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch posts', error: err.message });
  }
};

/**
 * GET /api/posts/slug/:slug
 * Public. Only ever returns a published post — an author's draft is never
 * reachable through this route even if someone guesses the slug.
 */
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug, status: 'published' }).populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.status(200).json({ success: true, data: { post } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch post', error: err.message });
  }
};

/**
 * PUT /api/posts/:id
 * Protected: authenticateUser + authorizeRoles('author')
 * Body already validated by validate(updatePostSchema) (all fields optional).
 * Ownership is enforced below — authorizeRoles only checks the ROLE, not
 * whether this specific user owns THIS specific post.
 */
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Ownership check: an author can only edit their OWN posts, never someone else's.
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this post' });
    }

    // Recompute readTime if content changed — same rule as createPost, so a
    // client can't freeze a stale readTime while editing content.
    if (req.body.content) {
      req.body.readTime = calculateReadTime(req.body.content);
    }

    Object.assign(post, req.body);
    await post.save(); // runs schema validators (slug format, status enum, etc.)

    return res.status(200).json({ success: true, message: 'Post updated successfully', data: { post } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with this slug already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update post', error: err.message });
  }
};

/**
 * DELETE /api/posts/:id
 * Protected: authenticateUser + authorizeRoles('author')
 * Same ownership rule as updatePost.
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post' });
    }

    await post.deleteOne();

    return res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete post', error: err.message });
  }
};

/**
 * PATCH /api/posts/:id/like
 * Protected: authenticateUser (any logged-in user — reader or author — may like a post)
 * Toggles the current user's id in/out of the post's `likes` array using
 * atomic $addToSet / $pull updates, so concurrent like requests from
 * different users can never clobber each other the way a
 * read-mutate-save cycle in JS could.
 */
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'published' }).select('likes');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userId.toString());

    const update = alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(post._id, update, { new: true }).select('likes');

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      data: { liked: !alreadyLiked, likeCount: updatedPost.likes.length },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    return res.status(500).json({ success: false, message: 'Failed to toggle like', error: err.message });
  }
};

 /* Protected: authenticateUser + authorizeRoles('author')
 * Returns only the CURRENT user's own drafts — scoped by req.user._id, so
 * one author can never see another author's unpublished work.
 */
const getAuthorDrafts = async (req, res) => {
  try {
    const drafts = await Post.find({ status: 'draft', author: req.user._id }).sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: { drafts } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch drafts', error: err.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  getAuthorDrafts,
  toggleLikePost,
};
