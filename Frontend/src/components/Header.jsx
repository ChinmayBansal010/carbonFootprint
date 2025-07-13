import React from "react";
import Navbar from "./Navbar";
import { motion } from "motion/react";

const Header = () => {
  return (
    <div
      className="relative min-h-screen mb-4 bg-cover bg-center flex flex-col w-full overflow-hidden"
      style={{ backgroundImage: "url('/header-bg4.jpg')" }}
      id="Header"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        transition={{ duration: 1.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center justify-center flex-1 pt-32 pb-16"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-green-300 via-blue-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl text-center mb-6 animate-pulse">
          🌍 Track. Reduce. Thrive.
        </h1>
        <span className="block text-lg md:text-2xl text-white bg-gradient-to-r from-green-700/80 via-blue-800/80 to-green-900/80 px-8 py-3 rounded-2xl shadow-2xl font-semibold tracking-wide mb-8 animate-bounce text-center">
          Join the Movement to a Greener Tomorrow!
        </span>
        <p className="text-white text-lg md:text-2xl font-medium shadow-xl bg-black/60 rounded-2xl px-8 py-6 max-w-3xl mx-auto text-center mb-8 tracking-wide">
          Track your impact with our{" "}
          <span className="text-green-300 font-bold">
            Carbon Footprint Tracker
          </span>
          . Log activities, get instant insights, and discover easy tips to cut
          emissions.
        </p>
        <a
          href="#CFTracker"
          className="mt-2 inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 hover:from-green-300 hover:to-blue-400 transition-all duration-200"
        >
          Start Tracking Now
        </a>
      </motion.div>
    </div>
  );
};

export default Header;
