const { getDb, findUserById } = require('../lib/store');

// Resolves the bearer token on a request to the user who owns it.
// Returns null rather than throwing so requireAuth owns the response shape.
function userFromRequest(req) {
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const session = getDb().sessions[match[1].trim()];
  if (!session) return null;

  return findUserById(session.userId) || null;
}

// Guards every route that reads or writes one user's own data. The message is
// written for a person because the frontend surfaces it in a toast, and the 401
// is what makes the client clear a token the server no longer recognises.
function requireAuth(req, res, next) {
  const user = userFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth, userFromRequest };
