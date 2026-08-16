/**
 * Role guard — use AFTER authenticateUser, since it relies on req.user
 * already being set.
 *
 * Usage:
 *   router.post('/posts', authenticateUser, authorizeRoles('author'), createPost);
 *   router.delete('/users/:id', authenticateUser, authorizeRoles('author', 'admin'), deleteUser);
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check — should never happen if authenticateUser ran first
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}.`,
      });
    }

    return next();
  };
};

module.exports = authorizeRoles;
