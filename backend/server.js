import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import books from "./routes/books.js";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", books);

app.get("/", (req, res) => {
  res.send("PDF Reader API is running...");
});

const testDBConnection = async () => {
  let connected = false;
  while (!connected) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Connected to PostgreSQL successfully");
      connected = true;
    } catch (err) {
      console.log("Waiting for PostgreSQL...", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", db: "failed", message: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testDBConnection();
});
