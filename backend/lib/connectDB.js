import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const intialDbConnection = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        
      })
      console.log("db connected")
      
    }
    catch (error) {
      console.error(error);
    }
  }
export default intialDbConnection;