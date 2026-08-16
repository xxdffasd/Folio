const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getCookieOptions } = require('../utils/cookieOptions');

/**
 * POST /api/auth/register
 * Body is already validated & type-checked by validate(registerUserSchema)
 * before this controller runs (see routes/authRoutes.js).
 */
const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // role is intentionally NOT taken from req.body — every new signup is a
    // 'reader' by default (the User model default). Promotion to 'author'
    // should happen through a separate, protected admin endpoint.
    const user = await User.create({ name, email, password, avatar });

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // password has `select: false` on the schema, so it must be explicitly requested
    const user = await User.findOne({ email }).select('+password');

    // Deliberately identical error message for "no such user" and "wrong
    // password" — this prevents attackers from using the login endpoint to
    // enumerate which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

/**
 * POST /api/auth/logout
 * Clearing the cookie requires passing the SAME options (path, sameSite,
 * secure, httpOnly) used to set it, or some browsers will ignore the clear.
 */
const logout = (req, res) => {
  res.clearCookie('token', getCookieOptions());
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * GET /api/auth/me
 * Convenience endpoint to verify the auth flow — protected by authenticateUser.
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.status(200).json({ success: true, data: { user } });
};

module.exports = { register, login, logout, getMe };
