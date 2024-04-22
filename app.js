import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"


const app= express();

app.use(cors())

app.use(cookieParser())
app.use(express.json());



//import routes
import userRouter from "./src/routes/user.routes.js"
import uploadRouter from "./src/routes/upload.routes.js"
import chatRouter from "./src/routes/chat.routes.js"

//use routes
app.use("/api/v1/user", userRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/uploadFile",uploadRouter)
app.use("/api/v1/chat",chatRouter)

export {app}