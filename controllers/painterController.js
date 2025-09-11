import Painter from '../models/Painter.js';
import Booking from '../models/Booking.js';
import bcrypt from 'bcryptjs';
import createToken from '../utils/createToken.js';
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";



// ✅ Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 Painter Signup
export const painterSignup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, city, workExperience, bio, specification } = req.body;

    // check existing
    const existingPainter = await Painter.findOne({ email });
    if (existingPainter) {
      return res.status(400).json({ message: 'Painter already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = "";
    if (req.file) {
      profileImage = req.file.path; // ✅ CloudinaryStorage already gives Cloudinary URL
    }

    const painter = await Painter.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      city,
      workExperience,
      bio,
      specification: Array.isArray(specification)
        ? specification
        : specification
        ? [specification]
        : [],
      profileImage, // ✅ Cloudinary URL
    });

    const token = createToken(painter._id);

    res.status(201).json({
      message: 'Painter registered successfully',
      token,
      painterId: painter._id,
      painter,
    });
  } catch (error) {
    console.error("🔥 Signup Error Details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* ---------- LOGIN ---------- */
export const painterLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const painter = await Painter.findOne({ email });
    if (!painter) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, painter.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(painter._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      painterId: painter._id,
      painter,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- GET PROFILE ---------- */
export const getPainterProfile = async (req, res) => {
  try {
    // Use req.painter instead of req.user
    const painter = await Painter.findById(req.painter._id).select("-password");
    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }
    res.json(painter);
  } catch (error) {
    console.error("Error fetching painter profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ---------- UPDATE PROFILE ---------- */
export const updatePainterProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.profileImage = req.file.path; // ✅ already Cloudinary URL
    }

    const painter = await Painter.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }

    res.json(painter);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};




// ✅ Add gallery image (Cloudinary)
export const addGalleryImage = async (req, res) => {
  try {
    const painterId = req.painter._id; // comes from auth middleware
    const { description } = req.body;

    const painter = await Painter.findById(painterId);
    if (!painter) return res.status(404).json({ message: "Painter not found" });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newImage = {
      image: req.file.path, // ✅ Cloudinary URL directly
      description,
    };

    painter.gallery.push(newImage);
    await painter.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      gallery: painter.gallery,
    });
  } catch (error) {
    console.error("Gallery upload error:", error);
    res.status(500).json({ message: "Server error while uploading gallery" });
  }
};

// ✅ Fetch Painter's Gallery
export const getGallery = async (req, res) => {
  try {
    const painter = await Painter.findById(req.painter._id).select("gallery");
    if (!painter) return res.status(404).json({ message: "Painter not found" });

    res.status(200).json({ gallery: painter.gallery });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gallery", error: err.message });
  }
};

// ✅ Update gallery description
export const updateGallery = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { description } = req.body;

    const painter = await Painter.findById(req.painter._id);
    if (!painter) return res.status(404).json({ message: "Painter not found" });

    const image = painter.gallery.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    image.description = description || image.description;
    await painter.save();

    res.status(200).json({ message: "Gallery updated", gallery: painter.gallery });
  } catch (err) {
    res.status(500).json({ message: "Failed to update gallery", error: err.message });
  }
};

// ✅ Delete gallery image from Cloudinary

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const painter = await Painter.findById(req.painter._id);
    if (!painter) return res.status(404).json({ message: "Painter not found" });

    const imageDoc = painter.gallery.id(id);
    if (!imageDoc) return res.status(404).json({ message: "Image not found" });

    // Delete from Cloudinary if URL exists
    if (imageDoc.image) {
      // Extract public_id from Cloudinary URL
      const publicId = imageDoc.image.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`painterApp/painters/gallery/${publicId}`);
    }

    imageDoc.deleteOne();
    await painter.save();

    res.json({
      message: "Image deleted successfully",
      gallery: painter.gallery,
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ---------- Bookings ---------- */

// ✅ Public: fetch painters for main page

export const getAllPainters = async (req, res) => {
  try {
    const { phone, city, name } = req.query;
    const query = {};

    if (phone) query.phoneNumber = { $regex: phone, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    const painters = await Painter.find(query).select("-password");

    const result = painters.map((p) => ({
      _id: p._id,
      name: p.name,
      bio: p.bio,
      city: p.city,
      phoneNumber: p.phoneNumber,
      profileImage: p.profileImage
        ? p.profileImage.startsWith("http")
          ? p.profileImage // already full URL (Cloudinary, etc.)
          : `${req.protocol}://${req.get("host")}/uploads/profileImages/${p.profileImage}`
        : null,
      galleryPreview: p.gallery ? p.gallery.slice(0, 2) : [],
    }));

    res.json(result);
  } catch (err) {
    console.error("getAllPainters error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};


// Get full painter details (profile + gallery)
export const getPainterById = async (req, res) => {
  try {
    const painter = await Painter.findById(req.params.id).select("-password");
    if (!painter) return res.status(404).json({ message: "Painter not found" });

    res.json(painter); // includes gallery array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get only gallery
export const getPainterGallery = async (req, res) => {
  try {
    const painter = await Painter.findById(req.params.id).select("gallery");

    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }

    res.status(200).json(painter.gallery);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching gallery",
      error: err.message,
    });
  }
};


// ✅ Public: create a booking (user → painter)
export const createBooking = async (req, res) => {
  try {
    const painterId = req.params.id;
    const { userId, userName, userEmail, date, message } = req.body;

    const booking = await Booking.create({
      painter: painterId,
      user: userId,
      userName,
      userEmail,
      date,
      message,
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};


// ✅ Painter: view their bookings (protected)
export const getUserBookings = async (req, res) => {
  try {
    const userEmail = req.user.email; // assuming req.user set by userProtect middleware

    const bookings = await Booking.find({ userEmail }).populate("painter", "name city profileImage");
    
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user bookings", error: err.message });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    // 1️⃣ Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // 2️⃣ Check authorization: only the painter of this booking can update
    if (booking.painter.toString() !== req.painter._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3️⃣ Update status
    booking.status = status;
    await booking.save();

    // 4️⃣ Return updated booking
    res.json({ message: "Booking updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};


/* ---------- LOGOUT ---------- */
export const painterLogout = async (req, res) => {
  try {
    // For JWT apps, logout = frontend deletes token.
    // Here, just return success so frontend can handle it.
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error during logout" });
  }
};

// ✅ Search painters by phone, city, or name
export const searchPainters = async (req, res) => {
  const { phone, city } = req.query;

  try {
    const query = {};

    if (phone) query.phoneNumber = phone; // ✅ matches your schema
    if (city) query.city = { $regex: city, $options: "i" }; // case-insensitive search

    const painters = await Painter.find(query);

    res.json(painters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};