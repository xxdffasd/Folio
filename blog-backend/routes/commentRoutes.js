const express = require('express');

// mergeParams: true is required because this router is mounted at
// /api/posts/:postId/comments in server.js — without it, :postId from the
// parent path would NOT be visible on req.params inside this router.
const router = express.Router({ mergeParams: true });

const { addComment, deleteComment, getPostComments } = require('../controllers/commentController');
const validate = require('../middleware/validate');
const authenticateUser = require('../middleware/authenticateUser');
const { createCommentSchema } = require('../validations/commentValidation');

// Mounted as: app.use('/api/posts/:postId/comments', commentRoutes)

// GET /api/posts/:postId/comments — public
router.get('/', getPostComments);

// POST /api/posts/:postId/comments — any authenticated user may comment
router.post('/', authenticateUser, validate(createCommentSchema), addComment);

// DELETE /api/posts/:postId/comments/:id — comment author OR the post's author
router.delete('/:id', authenticateUser, deleteComment);

module.exports = router;
