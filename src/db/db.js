import mongoose from 'mongoose'


const connectDB= async()=>{

    try {
        await mongoose.connect(process.env.MONGODB_URI,{
            dbName: 'videotube'   
        })
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Error while connecting with database".error)
    }

}
 
export {connectDB}