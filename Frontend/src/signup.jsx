import React, { useState } from "react";
import { motion } from "framer-motion";
import signbg from "./assets/sign-bg1.jpg";
import { supabase } from "./supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name },
      },
    });

    if (error) {
          toast.error("❌ Signup failed: " + error.message, {
            icon: "🚫",
          });
        } else {
          toast.success("🎉 Signup successful! Check your inbox to verify.", {
            icon: "✅",
            onClose: () => navigate("/login"),
          });
        }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${signbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
        className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-red-200/60"
      >
        <motion.h2
          className="text-4xl font-extrabold mb-2 text-center text-red-600 drop-shadow animate-bounce"
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        >
          Sign Up
        </motion.h2>
        <motion.p
          className="text-center text-gray-700 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Create your account to start tracking your carbon footprint!
        </motion.p>
        <motion.input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/80 text-gray-900 font-medium transition-all duration-300 focus:scale-105"
          required
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        />
        <motion.input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/80 text-gray-900 font-medium transition-all duration-300 focus:scale-105"
          required
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        />
        <motion.input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/80 text-gray-900 font-medium transition-all duration-300 focus:scale-105"
          required
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        />
        <motion.button
          type="submit"
          whileHover={{
            scale: 1.06,
            background: "linear-gradient(90deg, #ff5858 0%, #f857a6 100%)",
            boxShadow: "0 4px 24px 0 rgba(248,87,166,0.18)",
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg font-bold text-lg shadow-md transition"
        >
          Sign Up
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Signup;
