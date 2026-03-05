import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { Mongo_Db_Connection } from "../config/db.js"
import logger from "../config/logger.js"
import { routes } from "../routes/index.js"
import { errorHandler } from "../middleware/ErrorHandler.js"

const app = express()

// CORS configuration - allow both local dev and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://your-frontend-domain.com' // Update with your actual frontend domain
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Only serve static uploads in non-Vercel environments
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('uploads'))
}

// Connect to MongoDB
Mongo_Db_Connection()

// API Routes
app.use('/api', routes)

// Global error handler (must be last)
app.use(errorHandler)

export default app
