// controllers/adminController.js
import Admin from "../models/Admin.js";
import User from "../models/userModel.js";
import Painter from "../models/Painter.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



/* ---------- SIGNUP ---------- */
export const adminSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    // generate token
    const token = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- LOGIN ---------- */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- ADMIN DASHBOARD STATS ---------- */
export const getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const painters = await Painter.countDocuments();
    const bookings = await Booking.countDocuments();

    res.json({ users, painters, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- USER MANAGEMENT ---------- */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

/* ---------- PAINTER MANAGEMENT ---------- */
/* ---------- GET ALL PAINTERS ---------- */
export const getAllPainters = async (req, res) => {
  try {
    const painters = await Painter.find();
    res.json(painters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- UPDATE PAINTER STATUS ---------- */
export const updatePainterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const painter = await Painter.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!painter) return res.status(404).json({ message: "Painter not found" });

    res.json({ message: "Painter updated", painter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- DELETE PAINTER ---------- */
export const deletePainter = async (req, res) => {
  try {
    const { id } = req.params;
    const painter = await Painter.findByIdAndDelete(id);

    if (!painter) return res.status(404).json({ message: "Painter not found" });

    res.json({ message: "Painter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- BOOKING MANAGEMENT ---------- */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email") // ✅ populate customer details
      .populate("painterId", "name email"); // ✅ populate painter details

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};
export const cancelBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: "Booking cancelled" });
};
