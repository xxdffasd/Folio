const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing only the minimal claims needed for authorization
 * decisions (id + role). Never put the password or other sensitive fields
 * in the token — it is base64-encoded, NOT encrypted, so anyone holding the
 * cookie can decode and read the payload.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
