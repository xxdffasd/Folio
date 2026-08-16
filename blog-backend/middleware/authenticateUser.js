const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Reads the JWT from the httpOnly cookie (never from an Authorization header
 * — that's the whole point of using httpOnly cookies over localStorage
 * tokens), verifies it, then loads the current user from the DB and attaches
 * it to req.user.
 *
 * Why hit the DB instead of just trusting the decoded payload?
 *  - req.user becomes a real Mongoose document, so controllers can use
 *    req.user._id directly (e.g. when setting Post.author, or comparing
 *    against post.author to check ownership in updatePost/deletePost).
 *  - req.user.role always reflects the CURRENT role in the DB, not whatever
 *    role was true when the token was issued — so a role change takes effect
 *    immediately instead of waiting for the old token to expire.
 *
 * Cleanly distinguishes between:
 *  - no cookie at all              -> 401 "not authenticated"
 *  - expired token                 -> 401 "session expired"
 *  - tampered / malformed token    -> 401 "invalid token"
 *  - token valid but user deleted  -> 401 "user no longer exists"
 */
const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, role, iat, exp }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user; // full Mongoose doc (password excluded by the schema's `select: false`)
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    // Any other unexpected error (e.g. DB lookup failure)
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

module.exports = authenticateUser;
