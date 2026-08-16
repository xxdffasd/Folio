/**
 * Generic Zod validation middleware factory.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body'] - which part of the
 *   request to validate. Use 'query' for GET list endpoints that validate
 *   pagination/filter params (e.g. getPostsQuerySchema).
 *
 * Usage:
 *   router.post('/posts', validate(createPostSchema), postController.createPost);
 *   router.get('/posts', validate(getPostsQuerySchema, 'query'), postController.getPosts);
 *
 * On failure it returns a 400 with a flattened, field-keyed error object so
 * the frontend can map errors directly onto form fields.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Replace with the parsed & type-coerced data (e.g. query strings -> numbers)
  req[source] = result.data;
  next();
};

module.exports = validate;
