import express from "express";
import { registerUser, loginUser, getUserProfile, updateUser,
    getUserBookings, logoutUser
 } from "../controllers/userController.js";
import { userProtect } from "../middleware/auth.js";
import { uploadUserProfileImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.post("/register", uploadUserProfileImage.single("profileImage"), registerUser);

router.post("/login", loginUser);

// Protected
router.get("/me", userProtect, getUserProfile);

router.put("/me", userProtect, uploadUserProfileImage.single("profileImage"), updateUser);

// ✅ User bookings route
router.get("/bookings/me", userProtect, getUserBookings);


router.post("/logout", logoutUser);

export default router;
