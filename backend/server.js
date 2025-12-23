import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import books from "./routes/books.js";
import passwordReset from "./routes/passwordReset.js";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const app = express();

// allow Vercel to trust the proxy (required for secure cookies in serverless)
app.set("trust proxy", 1);

app.use(express.json());

const allowedOrigins = [
  "https://pdf-reader-frontend.onrender.com",
  "http://localhost:3000",
  // Add your new Vercel frontend URL here once you have it
  // e.g., "https://your-project-name.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", books);
app.use("/api/password", passwordReset);

app.get("/", (req, res) => {
  res.send("PDF Reader API is running on Vercel...");
});

// Simple non-blocking health check
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

export default app;
