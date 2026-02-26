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
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
Mongo_Db_Connection()
app.use('/api', routes)
app.use(errorHandler)   // ✅ global error handler — must be LAST

app.listen(process.env.PORT, () => {
  logger.info("Server is running on Port 🛸");
})
