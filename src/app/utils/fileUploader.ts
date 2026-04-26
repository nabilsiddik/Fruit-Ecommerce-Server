import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import type { Request } from "express";
import { envVars } from "../config/env.config.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

// Multer configuration using memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fixed Cloudinary Storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    public_id: (req: Request, file: any) => `${Date.now()}_${file.originalname}`,
  } as any,
});

const cloudinaryUpload = multer({ storage: cloudinaryStorage });

// Upload specific fields
const uploadSingle = upload.single("profileImage");
const uploadFile = upload.single("file");

const uploadMultipleImage = upload.fields([{ name: "images", maxCount: 15 }]);

const uploadProduct = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);

const uploadReviewImage = upload.fields([
  { name: "reviewImages", maxCount: 3 },
]);

const updateProfile = upload.fields([
  { name: "businessLogo", maxCount: 1 },
  { name: "portfolioImage", maxCount: 15 },
]);

const uploadToCloudinary = async (
  file: Express.Multer.File,
): Promise<{ Location: string; public_id: string }> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading file to Cloudinary:", error);
          return reject(error);
        }

        resolve({
          Location: result?.secure_url || "",
          public_id: result?.public_id || "",
        });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const fileUploader = {
  upload,
  uploadSingle,
  uploadMultipleImage,
  updateProfile,
  uploadProduct,
  uploadReviewImage,
  uploadFile,
  cloudinaryUpload,
  uploadToCloudinary,
};
