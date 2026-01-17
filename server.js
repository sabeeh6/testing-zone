import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ================= Config =================
const PORT = process.env.PORT || 3009;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/TournamentApp";


// ================= DB Connection =================
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // ❗ server band
  }
};

// ================= Server Start =================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
};

startServer();
