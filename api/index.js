import dotenv from "dotenv"
dotenv.config()
import { createApp } from "../config/app.js"

// Create app instance for Vercel serverless
const app = createApp()

// Default export - Vercel will use this as the handler
export default app
