const express = require('express');
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  getAuthorDrafts,
  toggleLikePost,
} = require('../controllers/postController');

const validate = require('../middleware/validate');
const authenticateUser = require('../middleware/authenticateUser');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createPostSchema, updatePostSchema, getPostsQuerySchema } = require('../validations/postValidation');

// ---------------------------------------------------------------------------
// Public routes — no auth required. Only ever expose PUBLISHED posts.
// ---------------------------------------------------------------------------

// GET /api/posts?page=1&limit=10&tag=nodejs&search=react&sort=newest
router.get('/', validate(getPostsQuerySchema, 'query'), getPosts);

// GET /api/posts/slug/my-first-post
router.get('/slug/:slug', getPostBySlug);

// ---------------------------------------------------------------------------
// Author-only routes.
// Static paths (e.g. /drafts/mine) are declared BEFORE dynamic /:id routes
// so Express doesn't try to match "drafts" as an :id value.
// ---------------------------------------------------------------------------

// GET /api/posts/drafts/mine
router.get('/drafts/mine', authenticateUser, authorizeRoles('author'), getAuthorDrafts);

// POST /api/posts
router.post('/', authenticateUser, authorizeRoles('author'), validate(createPostSchema), createPost);

// PUT /api/posts/:id
router.put('/:id', authenticateUser, authorizeRoles('author'), validate(updatePostSchema), updatePost);

// DELETE /api/posts/:id
router.delete('/:id', authenticateUser, authorizeRoles('author'), deletePost);

// ---------------------------------------------------------------------------
// Interaction routes — open to ANY authenticated user (reader or author).
// No authorizeRoles here on purpose: liking is not an author-only action.
// ---------------------------------------------------------------------------

// PATCH /api/posts/:id/like
router.patch('/:id/like', authenticateUser, toggleLikePost);

module.exports = router;
