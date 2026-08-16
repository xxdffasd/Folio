const express = require('express');
const router = express.Router();

const { uploadImage } = require('../controllers/uploadController');
const uploadSingleImage = require('../middleware/uploadMiddleware');
const authenticateUser = require('../middleware/authenticateUser');

// POST /api/upload
// Field name must be "image" (multipart/form-data) to match uploadSingleImage's .single('image').
// Any authenticated user can upload (e.g. avatar images for readers too),
// not just authors — restrict further with authorizeRoles('author') here if
// you want uploads limited to post cover images only.
router.post('/', authenticateUser, uploadSingleImage, uploadImage);

module.exports = router;
