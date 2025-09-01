import express from "express";
import {
  createBooking,
  getPainterBookings,
  getCustomerBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { userProtect, painterProtect } from "../middleware/auth.js";

const router = express.Router();

// ✅ User routes
router.post("/", userProtect, createBooking); 
router.get("/my-bookings", userProtect, getCustomerBookings); 

// ✅ Painter routes
router.get("/painter/bookings", painterProtect, getPainterBookings); 
router.put("/:bookingId/status", painterProtect, updateBookingStatus);

export default router;
