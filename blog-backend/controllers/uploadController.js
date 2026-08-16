/**
 * POST /api/upload
 * Protected: authenticateUser (only logged-in users may upload media).
 * By the time this controller runs, uploadSingleImage middleware has already
 * streamed the file to Cloudinary and populated req.file with the result.
 */
const uploadImage = (req, res) => {
  // req.file (added by multer-storage-cloudinary) shape:
  //   path      -> the Cloudinary secure_url (what you store on the Post/User doc)
  //   filename  -> the Cloudinary public_id (needed later if you ever delete the image)
  const { path: url, filename: publicId } = req.file;

  return res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: { url, publicId },
  });
};

module.exports = { uploadImage };
