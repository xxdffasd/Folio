const { z } = require('zod');

// Used on POST /auth/register
const registerUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters') // bcrypt truncates beyond 72 bytes
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // Role is intentionally NOT accepted from the client on register to prevent
  // privilege escalation (e.g. a reader signing up and setting role: 'author').
  // Role changes should go through a separate admin-only endpoint.
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

// Used on POST /auth/login
const loginUserSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// Used on PATCH /users/me — every field optional, but at least one must be present
const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

module.exports = { registerUserSchema, loginUserSchema, updateUserSchema };
