import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./lib/connectDB.js";
import router from "./routes/auth.route.js";
import fetch from "node-fetch";
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

const API_URL = "https://ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com/analyzeSymptomsAndDiagnose";

app.post("/api/diagnose", async (req, res) => {
  try {
    const { symptoms, patientInfo } = req.body;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY, // Secure API key in .env
        "X-RapidAPI-Host": "ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com",
      },
      body: JSON.stringify({ symptoms, patientInfo, lang: "en" }),
    });

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || "API Error" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.listen(port,()=>{
    console.log(`${port} Listening here`);
})