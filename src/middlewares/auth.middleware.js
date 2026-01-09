const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = await JWT.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;
