const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true, // every comment-list fetch is scoped to a single post, so this is the primary access pattern
    },
  },
  { timestamps: true }
);

// Compound index: comments are almost always fetched as "all comments for
// post X, newest first" — this index serves both the filter and the sort
// without an extra in-memory sort step.
commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
