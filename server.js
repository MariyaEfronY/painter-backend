// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // ✅ add this

// Routes
import painterRoutes from './routes/painterRoutes.js';
import painterImageRoutes from './routes/painterImageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";


// User Routes
import userRoutes from "./routes/userRoutes.js";


dotenv.config();
const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://painter-frontend-psi.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Auto-create upload folders if they don’t exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/profileImages'),
    path.join(__dirname, 'uploads/galleryImages'),
    path.join(__dirname, 'uploads/userProfileImages'), 
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};
createUploadDirs();

// ✅ Serve static image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  "/uploads/userProfileImages",
  express.static(path.join(__dirname, "uploads/userProfileImages"))
);
app.use("/uploads/galleryImages", express.static(path.join(process.cwd(), "uploads/galleryImages")));

// Painter routes
app.use("/api/painter", painterRoutes);
app.use('/api/painter/images', painterImageRoutes);
app.use('/api/bookings', bookingRoutes);

// User Routes
app.use("/api/users", userRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Subscribe Routes
app.use("/api/subscribe", subscribeRoutes);

// Error handling
process.on('uncaughtException', (err) => console.error('Unhandled Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

// ✅ Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

export default app;
