import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./signup.css";

export default function Signup() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Comprehensive validation before API call
      const { name, email, password, phone, address } = data;
      
      if (!name || name.length < 2) {
        toast.error("Name must be at least 2 characters", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        toast.error("Invalid email format", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 8) {
        toast.error("Password must be at least 8 characters", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      if (phone && !/^[0-9]{10}$/.test(phone)) {
        toast.error("Phone number must be 10 digits", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      // API call
      const res = await axios.post("http://localhost:3000/auth/signup", {
        name,
        email,
        password,
        phone,
        address
      });

      toast.success(res.data.message || "OTP Sent!", { position: "top-center" });
      setIsOtpSent(true);
      setUserEmail(email);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Signup failed";
      toast.error(errorMessage, { position: "top-center" });
      console.error("Signup Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      if (!otp || otp.length === 0) {
        toast.error("Please enter OTP", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:3000/auth/verify-otp", { 
        email: userEmail, 
        otp 
      });

      toast.success(res.data.message || "Signup successful", { position: "top-center" });
      
      // Use optional chaining and provide a default timeout
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "OTP verification failed";
      toast.error(errorMessage, { position: "top-center" });
      console.error("OTP Verification Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <form className="forms" onSubmit={handleSubmit(onSubmit)}>
        <input 
          type="text" 
          placeholder="Name" 
          {...register("name", { 
            required: "Name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" }
          })} 
        />
        {errors.name && <span className="error">{errors.name.message}</span>}

        <input 
          type="email" 
          placeholder="Email" 
          {...register("email", { 
            required: "Email is required",
            pattern: { 
              value: /\S+@\S+\.\S+/, 
              message: "Invalid email format" 
            }
          })} 
        />
        {errors.email && <span className="error">{errors.email.message}</span>}

        <input 
          type="password" 
          placeholder="Password" 
          {...register("password", { 
            required: "Password is required", 
            minLength: { 
              value: 8, 
              message: "Password must be at least 8 characters" 
            }
          })} 
        />
        {errors.password && <span className="error">{errors.password.message}</span>}

        <input 
          type="text" 
          placeholder="Address" 
          {...register("address")} 
        />

        <input 
          type="tel" 
          placeholder="Phone" 
          {...register("phone", { 
            pattern: { 
              value: /^[0-9]{10}$/, 
              message: "Phone number must be 10 digits" 
            }
          })} 
        />
        {errors.phone && <span className="error">{errors.phone.message}</span>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Signup"}
        </button>
      </form>

      {isOtpSent && (
        <div className="otp">
          <input 
            type="text" 
            placeholder="Enter OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            maxLength={6}
          />
          <button 
            onClick={verifyOtp} 
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}
    </>
  );
}