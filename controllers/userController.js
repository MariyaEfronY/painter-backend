// controllers/userController.js
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ Register User
// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      // ✅ Cloudinary automatically gives req.file.path as the image URL
      profileImage: req.file ? req.file.path : null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
// console.log(req)
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};


// controllers/userController.js
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      bio: user.bio,
      profileImage: user.profileImage || null, // ✅ Direct Cloudinary URL
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const user = req.user;

    // ✅ update all fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    user.bio = req.body.bio || user.bio;

    // ✅ handle profile image if uploaded
    if (req.file) {
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        bio: user.bio,
        profileImage: user.profileImage
          ? `${req.protocol}://${req.get("host")}/uploads/userProfileImages/${user.profileImage}`
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};


export const getUserBookings = async (req, res) => {
  try {
    // req.user is set by userProtect middleware
    const userEmail = req.user.email;

    const bookings = await Booking.find({ userEmail })
      .populate("painter", "name city profileImage"); // populate painter info

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user bookings", error: err.message });
  }
};


// ✅ Logout User
export const logoutUser = async (req, res) => {
  try {
    // If you're not storing blacklisted tokens, just tell frontend to clear token
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};
