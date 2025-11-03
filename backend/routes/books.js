import express from "express";
import db from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rename book
router.put("/books/:id/rename", verifyToken, async (req, res) => {
  const bookId = req.params.id;
  const { newName } = req.body;

  try {
    await db.query("UPDATE books SET title = $1 WHERE id = $2", [
      newName,
      bookId,
    ]);
    res.json({ message: "Book renamed successfully", newName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to rename book" });
  }
});

// Delete book
router.delete("/books/:id", verifyToken, async (req, res) => {
  const bookId = req.params.id;

  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete book" });
  }
});

export default router;
