import express from "express";
import mysql from "mysql2";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./uploadRoutes.js";

const app = express();
app.use(express.json());

// connect to MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pdf_reader_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.send("PDF Reader API is running...");
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
