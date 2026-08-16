const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index on email — enforced at DB level and used for fast login lookups
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default on find() queries
    },
    role: {
      type: String,
      enum: {
        values: ['reader', 'author'],
        message: '{VALUE} is not a supported role',
      },
      default: 'author',
    },
    avatar: {
      type: String, // Cloudinary/S3 URL
      default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
      match: [/^https?:\/\/.+/i, 'Avatar must be a valid URL'],
    },
  },
  { timestamps: true }
);

// Hash password only when it is new or modified — avoids re-hashing on unrelated updates
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used by the auth controller to verify login credentials
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive/internal fields whenever a user doc is serialized to JSON (e.g. in API responses)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
