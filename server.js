import dotenv from "dotenv"
dotenv.config()
import { createApp } from "./config/app.js"
import logger from "./config/logger.js"

// Only start server in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const app = createApp()
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    logger.info(`Server is running on Port ${PORT} 🛸`);
  })
}
