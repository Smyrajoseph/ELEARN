// authorization.js
export function authorizeAccess(req, res, resourceOwnerId, allowedRoles = []) {
  // Teachers/admins can access everything if their role is in allowedRoles
  if (allowedRoles.includes(req.user.role)) {
    return true;
  }

  // Otherwise, only allow if the user owns the resource
  if (req.user.id !== resourceOwnerId) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  return true;
}