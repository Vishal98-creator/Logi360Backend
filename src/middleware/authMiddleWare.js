const { verifyAccessToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // you can access req.user in controller
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Example Usage 
// const authenticate = require("../middleware/authMiddleware");

// auth.get("/profile", authenticate, async (req, res) => {
//   const { phoneNumber } = req.user;
//   res.json({ message: `Secure data for ${phoneNumber}` });
// });

module.exports = authenticate;
