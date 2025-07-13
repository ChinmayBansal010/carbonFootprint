import React, { useEffect, useState } from "react";
import menuIcon from "../assets/menu_icon.svg";
import crossIcon from "../assets/cross_icon.svg";
import logo from "../assets/logo.png";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dashavatar from "../assets/dash-avatar.png";
import { scrollWithOffset } from "../scrollHelper";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileMenu]);

  const navigate = useNavigate();

  const handleSmartLink = (sectionId) => {
    const currentPath = window.location.pathname;
    if (currentPath === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate(`/?scrollTo=${sectionId}&noAnim=true`);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignupClick = () => {
    navigate("/signup");
  };
  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleAvatarClick = () => {
    navigate("/dashboard"); // redirect to dashboard
  };

  return (
    <div className="absolute top-0 left-0 w-full z-20">
      <div className="backdrop-blur-md bg-black/40 shadow-lg rounded-b-2xl container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32">
        {/* Logo/Brand */}
        <img
          src={logo}
          alt="C-FootPrinter Logo"
          className="h-10 w-auto drop-shadow-lg"
        />
        {/* Desktop Links */}
        <div className="flex items-center">
          <ul className="hidden md:flex gap-8 text-white font-medium">
            <li
              onClick={() => handleSmartLink("Header", "/")}
              className="transition hover:text-green-300 cursor-pointer"
            >
              Home
            </li>
            <li
              onClick={() => handleSmartLink("CFTracker", "/")}
              className="transition hover:text-green-300 cursor-pointer"
            >
              Carbon Footprint Tracker
            </li>
            <li
              onClick={() => handleSmartLink("EImpacts", "/")}
              className="transition hover:text-green-300 cursor-pointer"
            >
              Environment Impacts
            </li>
            <li
              onClick={() => handleSmartLink("About", "/")}
              className="transition hover:text-green-300 cursor-pointer"
            >
              About Us
            </li>
          </ul>
          {/* Desktop Button */}
          <div className="hidden md:flex gap-3 ml-15">
            {!user ? (
              <>
                <button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-2 rounded-full shadow-md font-semibold hover:scale-105 transition"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleLoginClick}
                  className="bg-gradient-to-r from-red-400 via-red-600 to-red-800 text-white px-8 py-2 rounded-full shadow-md font-semibold hover:scale-105 hover:brightness-110 transition duration-300 ring-1 ring-red-500/30"
                >
                  Login
                </button>
              </>
            ) : (
              <img
                src={dashavatar}
                alt="Dashboard"
                onClick={handleAvatarClick}
                className="w-11 h-11 rounded-full ring-2 ring-green-400 ring-offset-2 ring-offset-black shadow-lg cursor-pointer hover:scale-110 hover:brightness-110 transition duration-300"
              />
            )}
          </div>
        </div>
        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMobileMenu(true)}
          src={menuIcon}
          className="md:hidden w-8 h-8 cursor-pointer ml-auto"
          alt="Menu"
        />
      </div>
      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          showMobileMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-3/4 max-w-xs h-full bg-gradient-to-br from-white via-green-50 to-blue-100 shadow-2xl transition-transform duration-500 ${
            showMobileMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-6">
            <img
              onClick={() => setShowMobileMenu(false)}
              src={crossIcon}
              className="w-7 cursor-pointer hover:rotate-90 transition-transform duration-300"
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-center gap-4 mt-10 px-5 text-lg font-semibold text-gray-800">
            {[
              { label: "Home", to: "Header" },
              { label: "Carbon Footprint Tracker", to: "CFTracker" },
              { label: "Environmental Impacts", to: "EImpacts" },
              { label: "About Us", to: "About" },
            ].map((item, idx) => (
              <li
                key={item.to}
                className="w-full flex justify-center animate-fade-in-up"
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              >
                <button
                  onClick={() => {
                    handleSmartLink(item.to);
                    setShowMobileMenu(false);
                  }}
                  className="py-3 px-4 rounded-full w-full block text-center transition bg-white/70 hover:bg-gradient-to-r hover:from-green-300 hover:to-blue-300 hover:text-white shadow-md"
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li
              className="w-full flex justify-center animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              {!user ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={handleSignupClick}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full shadow font-semibold hover:scale-105 transition"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="bg-gradient-to-r from-red-400 via-red-600 to-red-800 text-white px-6 py-2 rounded-full shadow font-semibold hover:scale-105 hover:brightness-110 transition"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <img
                  src={dashavatar}
                  onClick={handleAvatarClick}
                  className="w-11 h-11 rounded-full ring-2 ring-green-400 ring-offset-2 ring-offset-white shadow-lg cursor-pointer hover:scale-110 hover:brightness-110 transition duration-300"
                  alt="Dashboard"
                />
              )}
            </li>
          </ul>
        </div>
        {/* Animation keyframes */}
        <style>
          {`
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(30px);}
        100% { opacity: 1; transform: translateY(0);}
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.5s both;
      }
    `}
        </style>
      </div>
    </div>
  );
};

export default Navbar;
