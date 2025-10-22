import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "../cloudinaryConfig.js";
import db from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // <-- import middleware

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload file (protected)
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "pdf-reader",
      use_filename: true,
      unique_filename: false,
    });

    // Delete local file
    fs.unlinkSync(filePath);

    // Save record in MySQL using logged-in user ID
    const [resultInsert] = await db.execute(
      "INSERT INTO books (user_id, title, cloudinary_url) VALUES (?, ?, ?)",
      [req.user.id, req.file.originalname, result.secure_url]
    );

    res.json({
      message: "File uploaded and saved successfully",
      book_id: resultInsert.insertId,
      title: req.file.originalname,
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
});

// Get books for the logged-in user (protected)
router.get("/my-books", verifyToken, async (req, res) => {
  try {
    const [books] = await db.execute(
      "SELECT id, title, cloudinary_url, uploaded_at FROM books WHERE user_id = ? ORDER BY uploaded_at DESC",
      [req.user.id]
    );

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your books" });
  }
});

// Public route: Get all books uploaded by all users
router.get("/books", async (req, res) => {
  try {
    const [books] = await db.execute(
      `SELECT b.id, b.title, b.cloudinary_url, b.uploaded_at, u.username 
       FROM books b 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.uploaded_at DESC`
    );
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all books" });
  }
});

export default router;
