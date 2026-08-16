// dotenv.config() MUST be the very first thing that runs, before any other
// require() that reads process.env (e.g. config/db.js, utils/generateToken.js).
// If you require those modules before this line, they will read undefined
// env vars because Node caches module state on first require.
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Models (registering schemas with Mongoose)
require('./models/User');
require('./models/Post');
require('./models/Comment');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser()); // required so req.cookies is populated for authenticateUser

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
// Nested under posts so commentRoutes can read :postId via mergeParams
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
});

module.exports = app;
