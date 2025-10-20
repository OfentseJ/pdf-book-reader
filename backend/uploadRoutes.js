import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "./cloudinaryConfig.js";
import db from "./db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Example: user ID will come from frontend later (for now, you can hardcode it)
const TEST_USER_ID = 1;

router.post("/upload", upload.single("file"), async (req, res) => {
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

    // Save record in MySQL
    const [rows] = await db.execute(
      "INSERT INTO books (user_id, title, cloudinary_url) VALUES (?, ?, ?)",
      [TEST_USER_ID, req.file.originalname, result.secure_url]
    );

    res.json({
      message: "File uploaded and saved successfully",
      book_id: rows.insertId,
      title: req.file.originalname,
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
});

// Get all books for a specific user
router.get("/books/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Query all books for this user
    const [books] = await db.execute(
      "SELECT id, title, cloudinary_url, uploaded_at FROM books WHERE user_id = ? ORDER BY uploaded_at DESC",
      [userId]
    );

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

router.get("/books", async (req, res) => {
  try {
    const [books] = await db.execute(
      "SELECT b.id, b.title, b.cloudinary_url, b.uploaded_at, u.username FROM books b JOIN users u ON b.user_id = u.id ORDER BY b.uploaded_at DESC"
    );
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all books" });
  }
});

export default router;
