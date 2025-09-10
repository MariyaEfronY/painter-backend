// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import painterRoutes from './routes/painterRoutes.js';
import painterImageRoutes from './routes/painterImageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// ✅ Allow frontend origins (with protocol!)
const allowedOrigins = [
  "http://localhost:5173",
  "https://painter-frontend-lcfts38ka-mariyaefronys-projects.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Auto-create upload folders
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

// Test routes
app.get("/", (req, res) => {
  res.json({ message: "✅ Painter Backend is working!" });
});
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API route working correctly 🚀" });
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/uploads/userProfileImages", express.static(path.join(__dirname, "uploads/userProfileImages")));
app.use("/uploads/galleryImages", express.static(path.join(process.cwd(), "uploads/galleryImages")));

// Routes
app.use("/api/painter", painterRoutes);
app.use('/api/painter/images', painterImageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
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

// ✅ Export for Vercel
export default app;
