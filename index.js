import dotenv from "dotenv"
import { app } from "./app.js"
import {connectDB} from "./src/db/db.js"

dotenv.config({
    path: './.env'
})




const PORT= process.env.PORT || 8000

connectDB()
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT : ${PORT}`)
})


