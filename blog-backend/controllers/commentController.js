const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * POST /api/posts/:postId/comments
 * Protected: authenticateUser
 * Body already validated by validate(createCommentSchema).
 */
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Confirm the post actually exists (and is published) before allowing a
    // comment on it — also prevents comments piling up on a since-unpublished draft.
    const post = await Post.findOne({ _id: postId, status: 'published' });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user._id, // from authenticateUser — never trust an author id from the body
    });

    // Return the comment with author details populated so the frontend can
    // render it immediately without a second round-trip.
    await comment.populate('author', 'name avatar');

    return res.status(201).json({ success: true, message: 'Comment added successfully', data: { comment } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    return res.status(500).json({ success: false, message: 'Failed to add comment', error: err.message });
  }
};

/**
 * DELETE /api/comments/:id
 * Protected: authenticateUser
 * A comment may be deleted by:
 *   1. Its own author (anyone can remove their own comment), OR
 *   2. The author of the POST the comment lives on (moderation rights over
 *      their own post's comment section).
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('post', 'author');

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = comment.post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment' });
    }

    await comment.deleteOne();

    return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid comment id' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete comment', error: err.message });
  }
};

/**
 * GET /api/posts/:postId/comments
 * Public. Newest first, author populated with name + avatar only.
 */
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 }) // newest first — matches the { post: 1, createdAt: -1 } index on Comment
      .populate('author', 'name avatar');

    return res.status(200).json({ success: true, data: { comments } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    return res.status(500).json({ success: false, message: 'Failed to fetch comments', error: err.message });
  }
};

module.exports = { addComment, deleteComment, getPostComments };
