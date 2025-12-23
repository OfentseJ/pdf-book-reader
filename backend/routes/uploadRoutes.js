import express from "express";
import multer from "multer";
import { Readable } from "stream"; // NEW: Required for stream upload
import cloudinary from "../config/cloudinaryConfig.js";
import db from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. CHANGE: Use memoryStorage instead of disk dest
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload buffer to Cloudinary via stream
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Keeps original file format (PDF)
        folder: "pdf-reader",
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    // Convert buffer to stream and pipe to Cloudinary
    Readable.from(buffer).pipe(stream);
  });
};

// Upload file (protected)
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 2. CHANGE: Upload from memory buffer using helper
    const result = await streamUpload(req.file.buffer);

    // 3. REMOVED: fs.unlink is no longer needed (no file on disk)

    // Save in database
    const insertResult = await db.query(
      "INSERT INTO books (user_id, title, cloudinary_url) VALUES ($1, $2, $3) RETURNING id",
      [req.user.id, req.file.originalname, result.secure_url]
    );

    res.json({
      success: true,
      book: {
        id: insertResult.rows[0].id,
        name: req.file.originalname,
        url: result.secure_url,
        uploaded_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
});

// Get books for the logged-in user (protected)
router.get("/my-books", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, title, cloudinary_url, uploaded_at FROM books WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your books" });
  }
});

// Public route: Get all books uploaded by all users
router.get("/books", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.id, b.title, b.cloudinary_url, b.uploaded_at, u.username 
       FROM books b 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.uploaded_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all books" });
  }
});

export default router;
