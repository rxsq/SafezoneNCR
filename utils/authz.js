function requireAuth(req, res, next) {
  if (!req.session?.user)
    return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
