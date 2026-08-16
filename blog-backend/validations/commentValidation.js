const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

// Used on POST /posts/:postId/comments
// Note: `author` is derived from req.user (JWT payload) in the controller,
// and `post` is derived from the route param — neither is trusted from body.
const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be at most 1000 characters'),
});

// Used on PATCH /comments/:id
const updateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
});

module.exports = { createCommentSchema, updateCommentSchema, objectId };
