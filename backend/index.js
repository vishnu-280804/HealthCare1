import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./lib/connectDB.js";
import router from "./routes/auth.route.js";
dotenv.config();
const app = express();

const port = process.env.PORT;
console.log(process.env.EMAIL);
console.log(process.env.EMAIL_PASSWORD);
app.use(
    cors({
      origin: "http://localhost:5173", // Replace with your frontend's URL
      credentials: true, // Allow cookies to be sent/received
    })
  );
  
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    session({
        secret: "Vishnu", // Replace with a strong secret key
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Use `true` for HTTPS
    })
);

connectDB();
app.use("/auth",router);


app.get("/",(req,res)=>{
    res.send("Hello World!");
    req.session.views++;
})

app.listen(port,()=>{
    console.log(`${port} Listening here`);
})