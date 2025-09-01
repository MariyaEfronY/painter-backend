import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Painter from "../models/Painter.js"; // ✅ use your actual filename

// Protect User Routes
export const userProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Protect Painter Routes
export const painterProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.painter = await Painter.findById(decoded.id).select("-password");
    if (!req.painter) {
      return res.status(401).json({ message: "Painter not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
