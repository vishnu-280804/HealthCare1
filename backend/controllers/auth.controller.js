import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

let otpStore = {}; // Store OTPs temporarily for each email

// Generate OTP and send via email
const sendOtp = async (email) => {
    const otp = crypto.randomInt(100000, 999999); // Generate 6-digit OTP
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // Store OTP for 5 minutes

    // Log OTP for debugging
    console.log(`OTP generated for ${email}: ${otp}`);
    console.log(`OTP expiration date: ${new Date(otpStore[email].expires)}`);
    console.log(`OTP Store after generation:`, otpStore);

    // Create a transporter using your email configuration
    const transporter = nodemailer.createTransport({
        service: "gmail", // Gmail SMTP service
        auth: {
            user: process.env.EMAIL, // Your Gmail address
            pass: process.env.APP_PASSWORD, // Your App Password from Gmail (if 2FA enabled)
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP for Verification",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Failed to send OTP:", error);
    }
};

export const signup = async (req, res) => {
    let { name, password, email, address, phone } = req.body;
    email = email.toLowerCase();

    // Input validation
    if (!name || !password || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Send OTP to the email
        await sendOtp(email);

        // Store user details temporarily (for future OTP verification)
        otpStore[email].userDetails = { name, password, address, phone };

        return res.status(201).json({ message: "OTP sent to email for verification" });
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};

// Verify OTP and finalize signup
// Verify OTP and finalize signup
export const verifyOtp = async (req, res) => {
    let { email, otp } = req.body;
    email = email.toLowerCase();

    // Log the email and OTP received in the request
    console.log(`Email received for OTP verification: ${email}`);
    console.log(`OTP received for verification: ${otp}`);

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Log the entire OTP store for debugging
    console.log(`Current OTP Store:`, otpStore);

    const storedOtp = otpStore[email];
    console.log(`Trying to verify OTP for ${email}: `, storedOtp); // Log OTP store

    if (!storedOtp) {
        console.log(`No OTP found for ${email}`);
        return res.status(400).json({ message: "No OTP found for this email" });
    }

    // Log stored OTP and expiration date for debugging
    console.log(`Stored OTP for ${email}: ${storedOtp.otp}`);
    console.log(`OTP expiration date: ${new Date(storedOtp.expires)}`);
    console.log(`Current time: ${new Date()}`);

    // Check if OTP matches and is not expired
    if (storedOtp.otp !== parseInt(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (storedOtp.expires < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid, proceed with user creation
    const { name, password, address, phone } = storedOtp.userDetails;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, name, password: hashPassword, address, phone });
    await newUser.save();

    // Remove OTP from store after successful verification
    delete otpStore[email];

    return res.status(201).json({ message: "Signup successful" });
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Check credentials
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = { id: user._id, name: user.name, email: user.email };
            return res.status(200).json({ message: "Signin successful" });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(400).json({ message: "Bad Credentials" });
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "Logout Successfull" });
        });
    } else {
        return res.status(401).json({ message: "Error" });
    }
};

export const check = (req, res) => {
    if (req.session.user) {
        return res.status(201).json({ message: "User is Present" });
    } else {
        return res.status(401).json({ message: "Bad request sent" });
    }
};

export const sendEmail  = async(req,res)=>{


  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail SMTP service
    auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.APP_PASSWORD, // Your App Password from Gmail (if 2FA enabled)
    },
});

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "We will contact you soon",
    text: "Thank you for reaching out! We will contact you soon.",
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }


}