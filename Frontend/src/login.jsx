import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ecoIcons = ["🌱", "🌿", "🌳", "🌻", "🍃", "🌎", "🌲", "🌼"];

// ✅ Helper function to log today's login
const logUserLogin = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  // Check if already logged in today
  const { data, error } = await supabase
    .from("login_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("login_date", today);

  if (error) {
    console.error("Error checking login logs:", error.message);
    return;
  }

  // If no entry, insert new log
  if (data.length === 0) {
    const { error: insertError } = await supabase.from("login_logs").insert([
      {
        user_id: userId,
        login_date: today,
      },
    ]);
    if (insertError) {
      console.error("Error logging login:", insertError.message);
    }
  }
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("❌ Login failed: " + error.message, {
        icon: "🚫",
      });
    } else {
      const user = data.user;

      if (user) {
        await logUserLogin(user.id); // ✅ log today’s login

        toast.success("🎉 Login successful!", {
          icon: "✅",
          onClose: () => navigate("/dashboard"), // redirect to dashboard
        });
      }
    }
  };

  // Floating icon animation
  const floatVariants = {
    animate: (i) => ({
      y: [0, -30 - i * 2, 0],
      x: [0, i % 2 === 0 ? 20 + i * 2 : -20 - i * 2, 0],
      rotate: [0, i % 2 === 0 ? 10 : -10, 0],
      transition: {
        duration: 3 + i * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden animate-gradient"
      style={{
        background: "linear-gradient(120deg, #43e97b, #38f9d7, #43e97b 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientMove 8s ease-in-out infinite",
      }}
    >
      {/* Floating icons */}
      {ecoIcons.map((icon, i) => (
        <motion.span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            top: `${10 + i * 10}%`,
            left: `${i % 2 === 0 ? 5 : 85}%`,
            zIndex: 1,
            fontSize: `${2.5 + (i % 3)}rem`,
            opacity: 0.18 + (i % 3) * 0.08,
            filter: "blur(0.5px)",
          }}
          custom={i}
          variants={floatVariants}
          animate="animate"
        >
          {icon}
        </motion.span>
      ))}

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col gap-6"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(34,197,94,0.25), 0 1.5px 8px 0 rgba(56,249,215,0.15)",
        }}
      >
        <motion.div
          initial={{ scale: 0.7, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
          className="flex flex-col items-center mb-2"
        >
          <span className="text-5xl mb-2 animate-bounce">🌎</span>
          <h2 className="text-3xl font-extrabold text-green-700 drop-shadow text-center">
            Welcome Back!
          </h2>
          <p className="text-center text-green-800 text-base mt-1">
            Log in to continue your sustainable journey.
          </p>
        </motion.div>

        {/* Login form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          className="flex flex-col gap-4"
        >
          <label className="text-sm font-semibold text-green-900">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-900 font-medium transition-all duration-300 focus:scale-105"
            required
          />
          <label className="text-sm font-semibold text-green-900">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-900 font-medium transition-all duration-300 focus:scale-105"
            required
          />
          <div className="flex justify-end">
            <a href="#" className="text-xs text-green-700 hover:underline">
              Forgot your password?
            </a>
          </div>
          <motion.button
            whileHover={{
              scale: 1.07,
              background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              boxShadow: "0 4px 24px 0 rgba(56,249,215,0.18)",
            }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white py-3 rounded-lg font-bold text-lg shadow-md transition"
          >
            Login
          </motion.button>
        </motion.form>

        {/* Signup link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-green-800 mt-2"
        >
          <span>Don't have an account?</span>{" "}
          <a
            href="/signup"
            className="text-green-700 font-semibold hover:underline hover:text-blue-500 transition"
          >
            Create account
          </a>
        </motion.div>
      </motion.div>

      {/* Animated gradient keyframes */}
      <style>
        {`
          @keyframes gradientMove {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
    </div>
  );
};

export default Login;
