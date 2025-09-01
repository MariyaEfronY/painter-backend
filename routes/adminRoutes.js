// routes/adminRoutes.js
import express from "express";
import { adminLogin, getAdminStats, getAllUsers, deleteUser,
         getAllPainters, updatePainterStatus, 
        deletePainter,
         getAllBookings, cancelBooking,  adminSignup } from "../controllers/adminController.js";
import { adminProtect } from "../middleware/adminProtect.js";

const router = express.Router();

// Auth
router.post("/login", adminLogin);
router.post("/signup", adminSignup);

// Dashboard
router.get("/stats", getAdminStats);

// Users
router.get("/users", adminProtect, getAllUsers);
router.delete("/users/:id", adminProtect, deleteUser);

// Painters
// Painters Management
router.get("/painters", getAllPainters);
router.put("/painters/:id", updatePainterStatus);
router.delete("/painters/:id", deletePainter);

// Bookings
router.get("/bookings", adminProtect, getAllBookings);
router.delete("/bookings/:id", adminProtect, cancelBooking);

export default router;
