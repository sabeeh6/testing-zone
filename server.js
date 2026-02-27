import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { Mongo_Db_Connection } from "./config/db.js"
import logger from "./config/logger.js"
import { routes } from "./routes/index.js"
import { errorHandler } from "./middleware/ErrorHandler.js"

const app = express()
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))
Mongo_Db_Connection()
app.use('/api', routes)
app.use(errorHandler)   // ✅ global error handler — must be LAST

app.listen(process.env.PORT, () => {
  logger.info("Server is running on Port 🛸");
})
