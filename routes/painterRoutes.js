import express from "express";
import {
  painterSignup,
  painterLogin,
  getPainterProfile,
  updatePainterProfile,
  addGalleryImage,
  getGallery, 
  updateGallery,
  deleteGalleryImage,
  getAllPainters,
  getPainterById,
  getPainterGallery,
  createBooking,
  getUserBookings,
  updateBookingStatus,
  painterLogout,
  searchPainters,
  searchPaintersByPhone 
} from "../controllers/painterController.js";

import { painterProtect } from "../middleware/auth.js";
import { userProtect } from "../middleware/auth.js";
import {
  uploadProfileImage,
  uploadGalleryImage,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Auth
// 🔹 use uploadProfileImage for signup only if you allow profile image upload during signup
router.post("/signup", uploadProfileImage.single("profileImage"), painterSignup);
router.post("/login", painterLogin);

// Profile
router.get("/profile", painterProtect, getPainterProfile);
router.put(
  "/profile/:id",
  painterProtect,
  uploadProfileImage.single("profileImage"),
  updatePainterProfile
);

// Gallery
router.post(
  "/gallery",
  painterProtect,
  uploadGalleryImage.single("image"),
  addGalleryImage
);
router.get("/gallery", painterProtect, getGallery);
router.put("/gallery/:imageId", painterProtect, updateGallery);
router.delete(
  "/gallery/:id",
  painterProtect, // ✅ protect route
  deleteGalleryImage
);


// 🔹 Public
router.get("/main", getAllPainters);  
router.get("/search", searchPainters);
router.get("/:id", getPainterById);
router.get("/:id/gallery", getPainterGallery);
router.post("/:id/book", createBooking);


// 🔹 Painter Bookings (protected)
router.post("/:id/book", userProtect, createBooking);
router.get("/bookings/me", userProtect, getUserBookings);
router.put("/bookings/:bookingId/status", painterProtect, updateBookingStatus);


// GET /api/painters/search/phone?phoneNumber=..
router.get("/painters/search/phone", searchPaintersByPhone);



router.post("/logout", painterLogout);



export default router;
