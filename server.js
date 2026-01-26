import express from "express"
import  dotenv  from "dotenv"
import cors from "cors"
import { Mongo_Db_Connection } from "./config/db.js"
import logger from "./config/logger.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))
Mongo_Db_Connection()

app.listen(process.env.PORT , ()=>{
  logger.info("Server is running on Port 🛸");
})
