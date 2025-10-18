import express from "express";
import multer from "multer";
import cloudinary from "./cloudinaryConfig.js";
import fs from "fs";

const router = express.Router();

// Multer setup for temporary storage
const upload = multer({ dest: "uploads/" });

// Upload route for PDFs
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw", // use 'raw' for non-image files like PDFs
      folder: "pdf-reader", // optional folder name in Cloudinary
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    res.json({
      message: "File uploaded successfully",
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
});

export default router;
