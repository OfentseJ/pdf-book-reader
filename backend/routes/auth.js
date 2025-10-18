import express from "express";
import bcrypt from "bcryptjs";
import mysql from "mysql2";

const router = express.Router();

// create a database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pdf_reader_db",
});

// Register new user
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "User registration failed" });
    }
    res.json({ message: "User registered successfully" });
  });
});

// Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  });
});

export default router;
