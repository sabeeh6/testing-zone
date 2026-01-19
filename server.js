import express from "express"
import  dotenv  from "dotenv"
import cors from "cors"
import { DB } from "./config/db.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))
DB()
// console.log("DB" , process.env.MONGO_URI);

app.listen(process.env.PORT , ()=>{
  console.log("Server is running on Port 🛸");
})
