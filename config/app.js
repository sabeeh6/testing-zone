import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Mongo_Db_Connection } from "./db.js"
import logger from "./logger.js"
import { routes } from "../routes/index.js"
import { errorHandler } from "../middleware/ErrorHandler.js"

export function createApp() {
  const app = express()

  // CORS configuration - allow both local dev and production
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://testing-zone-frontend.vercel.app',
  ].filter(Boolean)

  // Add production frontend URL from environment variable
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL)
  }

  // Add any additional origins from comma-separated env variable
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim()))
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl requests)
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

  return app
}
