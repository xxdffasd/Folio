const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * CloudinaryStorage plugs directly into Multer as its storage engine —
 * instead of writing the file to local disk, Multer streams it straight to
 * Cloudinary and the resulting file object (available as req.file) contains
 * Cloudinary's response, including `path` (the secure_url) and `filename`
 * (the public_id), which is what we need to build/delete the image later.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-app', // keeps uploads namespaced in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Downscale oversized images on the way in — keeps page-load weight down
    // without rejecting a perfectly valid large photo from a phone camera.
    transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
  },
});

/**
 * Extra defense-in-depth on top of `allowed_formats` above: Cloudinary's
 * `allowed_formats` inspects the file extension, whereas this checks the
 * actual MIME type reported by the upload — rejecting mismatched or spoofed
 * file types before they're even sent to Cloudinary.
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, and WEBP image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

/**
 * Wraps multer's single-file middleware so that its errors (wrong file type,
 * file too large, no file field, etc.) come back as clean, consistent JSON
 * instead of Express's default HTML error page or an uncaught exception.
 */
const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image must be 5MB or smaller' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      // Thrown from fileFilter above (unsupported MIME type)
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was provided' });
    }
    next();
  });
};

module.exports = uploadSingleImage;
