// middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ✅ Painter Profile Images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "painterApp/painters/profileImages",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ User Profile Images
const userProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "painterApp/users/profileImages",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ Painter Gallery Images
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "painterApp/painters/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ Multer Uploaders
export const uploadProfileImage = multer({ storage: profileStorage });
export const uploadUserProfileImage = multer({ storage: userProfileStorage });
export const uploadGalleryImage = multer({ storage: galleryStorage });
