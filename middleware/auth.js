import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// Middleware to verify HR role
export const verifyHR = (req, res, next) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied. HR role required." });
  }
  next();
};

// Middleware to verify User role
export const verifyUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Access denied. User role required." });
  }
  next();
};

// Alias for authenticateJWT (for backward compatibility)
export const authenticateJWT = verifyToken;

