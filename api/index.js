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

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://testing-zone-frontend.vercel.app',
].filter(Boolean)

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim()))
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Static uploads
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('uploads'))
}

// Connect to MongoDB
Mongo_Db_Connection()

// API Routes
app.use('/api', routes)

// Global error handler
app.use(errorHandler)

// Export for Vercel
export default app

// Start server locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    logger.info(`Server is running on Port ${PORT} 🛸`);
  })
}
