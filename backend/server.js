import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.send("PDF Reader API is running...");
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
