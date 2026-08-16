const { z } = require('zod');

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)');

// Used on POST /posts — author is NOT taken from the body, it's derived from
// req.user (the authenticated JWT payload) in the controller, so it's absent
// here on purpose to prevent a user from creating a post "as" someone else.
const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must be at most 150 characters'),

  slug: slugField,

  content: z
    .string({ required_error: 'Content is required' })
    .min(20, 'Content must be at least 20 characters'),

  coverImage: z.string({ required_error: 'Cover image is required' }).url('Cover image must be a valid URL'),

  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(30))
    .max(10, 'A post can have at most 10 tags')
    .optional()
    .default([]),

  status: z.enum(['draft', 'published']).optional().default('draft'),

  // readTime is intentionally NOT accepted from the client — the controller
  // (controllers/postController.js) computes it from `content` on every
  // create/update, so a client can never lie about how long a post takes to read.
});

// Used on PUT/PATCH /posts/:id — everything optional, but disallow an empty payload
const updatePostSchema = createPostSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided to update',
});

// Used on GET /posts for validating/coercing query params (pagination, filtering, search)
const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.enum(['draft', 'published']).optional(),
  tag: z.string().trim().toLowerCase().optional(),
  author: objectId.optional(),
  search: z.string().trim().min(1).optional(), // powers the $text search
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
});

module.exports = { createPostSchema, updatePostSchema, getPostsQuerySchema, objectId };
