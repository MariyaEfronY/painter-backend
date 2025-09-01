import Booking from "../models/Booking.js";

// ✅ Create Booking (User must be logged in)
export const createBooking = async (req, res) => {
  try {
    const { painterId, date, time } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, login required" });
    }

    const newBooking = new Booking({
      customerId: req.user._id, // ✅ taken from auth middleware
      painterId,
      date,
      time,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// ✅ User can view their own bookings
export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate("painterId", "name city");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Painter can view their bookings
export const getPainterBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ painterId: req.painter._id })
      .populate("customerId", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Painter updates booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ensure only the painter who owns this booking can update it
    if (booking.painterId.toString() !== req.painter._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
