import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  painterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Painter",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
