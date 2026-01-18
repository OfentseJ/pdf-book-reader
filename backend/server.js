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

app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://pdf-book-reader-rho.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
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

// === 🔴 UPDATED SECTION BELOW ===
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  // Capture the server instance
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });

  server.setTimeout(300000);
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 120000;
}

export default app;
