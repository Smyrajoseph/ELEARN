// middleware/rbac.js
export function requireRole(roles) {
  return (req, res, next) => {
    // Ensure user is authenticated and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}