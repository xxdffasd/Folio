/**
 * Converts "7d" / "12h" / "30m" style JWT_EXPIRES_IN values into a
 * millisecond maxAge for the cookie. Falls back to 7 days if unparsable.
 */
const parseExpiryToMs = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn || '');
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * unitMs[unit];
};

/**
 * Cookie options for the auth token.
 *
 * - httpOnly: true      -> JavaScript (document.cookie) can never read this
 *                          cookie, which blocks XSS-based token theft.
 * - sameSite: 'strict'  -> the cookie is never sent on cross-site requests,
 *                          which blocks CSRF attacks that ride the cookie.
 * - secure               -> the browser will only send this cookie over HTTPS.
 *                          It MUST be true in production. It is conditionally
 *                          set based on NODE_ENV here because hardcoding it to
 *                          `true` would silently break local development,
 *                          since http://localhost is not HTTPS and the browser
 *                          would refuse to store/send the cookie at all.
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: parseExpiryToMs(process.env.JWT_EXPIRES_IN),
});

module.exports = { getCookieOptions };
