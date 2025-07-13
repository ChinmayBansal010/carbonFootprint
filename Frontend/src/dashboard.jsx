import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import dashavatar from "./assets/dash-avatar.png";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const badgeIcons = {
  "Low Carbon Hero": "/assets/low_carbon_hero.png",
  "Below Global Average": "/assets/below_avg.png",
  "Plastic Reducer": "/assets/plastic_reducer.png",
  "Eco Commuter": "/assets/eco_commutor.png",
  "Green Eater": "/assets/green_eater.png",
  "Energy Saver": "/assets/energy_saver.png",
  "Minimal Shopper": "/assets/minimal_shopper.png",
  "Water Wise": "/assets/water_wise.png",
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loginLogs, setLoginLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [badges, setBadges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkForDayEndLogout = async () => {
      const storedDate = localStorage.getItem("login_date");
      const today = new Date().toISOString().split("T")[0];
      if (storedDate && storedDate !== today) {
        await supabase.auth.signOut();
        localStorage.removeItem("login_date");
        navigate("/login");
      } else if (!storedDate) {
        localStorage.setItem("login_date", today);
      }
    };
    checkForDayEndLogout();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const avatar = user.user_metadata?.avatar_url;
        if (avatar && avatar !== "" && avatar !== dashavatar) {
          setAvatarUrl(avatar);
        }

        const { data: logs } = await supabase
          .from("login_logs")
          .select("login_date")
          .eq("user_id", user.id)
          .order("login_date", { ascending: true });

        if (logs?.length) {
          const uniqueDays = [...new Set(logs.map((log) => log.login_date))];
          setLoginLogs(uniqueDays);
          setTotalDays(uniqueDays.length);

          let currentStreak = 0;
          let prevDate = new Date();
          prevDate.setDate(prevDate.getDate() + 1);

          for (let i = uniqueDays.length - 1; i >= 0; i--) {
            const logDate = new Date(uniqueDays[i]);
            const expectedDate = new Date(prevDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
            if (logDate.toDateString() === expectedDate.toDateString()) {
              currentStreak++;
              prevDate = logDate;
            } else {
              break;
            }
          }
          setStreak(currentStreak);
        }

        const checkAndAwardBadges = async (userId, existingBadges) => {
          const { data: footprintData, error: footprintError } = await supabase
            .from("user_footprints")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (footprintError || !footprintData) {
            if (footprintError && footprintError.code !== "PGRST116") {
              // Ignore 'single row not found'
              console.error("Error fetching footprint data:", footprintError);
            }
            return [];
          }

          const newBadgesToAward = [];
          const badgeCriteria = {
            "Low Carbon Hero": footprintData.total_footprint < 2.0,
            "Below Global Average": footprintData.total_footprint < 4.7,
            "Plastic Reducer": footprintData.plastic_usage < 5,
            "Eco Commuter": footprintData.transport_footprint < 100,
            "Green Eater": footprintData.diet_footprint < 150,
            "Energy Saver": footprintData.energy_footprint < 200,
            "Minimal Shopper": footprintData.shopping_footprint < 50,
            "Water Wise": footprintData.water_usage < 3000,
          };

          for (const badgeName in badgeCriteria) {
            if (badgeCriteria[badgeName] && !existingBadges.includes(badgeName)) {
              newBadgesToAward.push({ user_id: userId, badge_name: badgeName });
            }
          }

          if (newBadgesToAward.length > 0) {
            const { error: insertError } = await supabase
              .from("user_badges")
              .insert(newBadgesToAward);

            if (insertError) {
              console.error("Error awarding badges:", insertError);
              return [];
            }
            return newBadgesToAward.map((b) => b.badge_name);
          }
          return [];
        };

        // 1. Fetch existing badges
        let currentBadges = [];
        const { data: badgeData, error: badgeError } = await supabase // Added error variable
          .from("user_badges")
          .select("badge_name")
          .eq("user_id", user.id);

        if (badgeError) { // Check for error during fetching
            console.error("Error fetching existing badges:", badgeError);
        } else if (badgeData) {
            currentBadges = badgeData.map((b) => b.badge_name);
            console.log("Dashboard: Fetched existing badges:", currentBadges); // DEBUGGING: Log fetched badges
        }


        // 2. Check for and award new badges
        let newlyAwardedBadges = await checkAndAwardBadges(user.id, currentBadges);
        if (newlyAwardedBadges.length > 0) {
            console.log("Dashboard: Newly awarded badges:", newlyAwardedBadges); // DEBUGGING: Log newly awarded badges
        }

        // 3. Combine and set the final list of badges
        setBadges([...currentBadges, ...newlyAwardedBadges]);
        console.log("Dashboard: Final badges set:", [...currentBadges, ...newlyAwardedBadges]); // DEBUGGING: Log final badges
      }
    };
    fetchUserData();
  }, [user]); // CRUCIAL: Re-run when user object changes

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const NAVBAR_HEIGHT = 80;

  return (
    <div
      id="Dashboard"
      className="min-h-screen bg-gradient-to-br from-black via-[#181c23] to-[#232526] text-white px-2 md:px-8 pb-8 pt-24"
      style={{ minHeight: "100vh" }}
    >
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar id="Navbar" />
      </div>

      <div
        // Changed grid-cols-3 to grid-cols-2 for better centering with two main cards
        // Added justify-items-center to center the cards within their grid columns
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-10 items-stretch justify-items-center"
        style={{ marginTop: `${NAVBAR_HEIGHT + 16}px` }}
      >
        {/* USER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
          className="bg-[#10141a] border border-[#2af598]/20 text-white rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col items-center hover:shadow-[0_0_32px_0_rgba(42,245,152,0.25)] transition-shadow duration-300 overflow-hidden w-full max-w-md" // Added w-full max-w-md to help with centering and consistent width
        >
          <div className="relative mb-4">
            <span className="absolute inset-0 rounded-full border-2 md:border-4 border-green-400 animate-pulse"></span>
            <img
              src={avatarUrl || dashavatar}
              alt="User Avatar"
              className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-green-400 shadow-xl object-cover hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute bottom-2 right-2 bg-green-400 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#10141a]" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-wider text-center text-[#2af598] mb-2">
            {user?.user_metadata?.name || "Welcome User"}
          </h2>
          <div className="text-xs text-gray-400 mb-2 font-mono break-all">
            ID: {user?.id?.slice(0, 8) || "--------"}
          </div>
          <p className="text-green-400 mt-1 font-semibold text-xs md:text-sm font-mono">
            Rank: 2,417,460
          </p>
          <p className="text-xs md:text-sm text-gray-400 mt-2">
            🌍 {user?.user_metadata?.country || "India"}
          </p>
          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 hover:shadow-lg transition rounded-full text-xs md:text-sm font-semibold"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="mt-3 px-4 py-2 md:px-6 md:py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-xs md:text-sm font-semibold"
          >
            Logout
          </button>
        </motion.div>

        {/* BADGES CARD - COMMENTED OUT */}
        {/*
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          className="bg-[#10141a] border border-[#2af598]/20 text-white rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col hover:shadow-[0_0_32px_0_rgba(42,245,152,0.25)] transition-shadow duration-300"
        >
          <h3 className="text-lg md:text-xl font-bold mb-4 text-[#2af598] tracking-wider">
            🏅 Your Badges
          </h3>
          {badges.length === 0 ? (
            <p className="text-gray-400 italic">
              No badges earned yet. Start tracking your carbon footprint!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-green-400 mb-1">
                    <img
                      src={badgeIcons[badge] || "/assets/default_badge.png"}
                      alt={badge}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.src = "/assets/default_badge.png";
                        e.target.className = "w-10 h-10 object-contain";
                      }}
                    />
                  </div>
                  <span className="text-xs text-center text-gray-300">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        */}

        {/* STREAK CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
          className="bg-[#10141a] border border-[#2af598]/20 text-white rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col hover:shadow-[0_0_32px_0_rgba(42,245,152,0.25)] transition-shadow duration-300 w-full max-w-md" // Added w-full max-w-md
        >
          <h3 className="text-lg md:text-xl font-bold mb-4 text-[#2af598] tracking-wider text-center">
            🔥 Streak
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mb-2 text-center">
            Total active days: {totalDays}
          </p>
          <p className="text-xs md:text-sm text-gray-400 mb-4 text-center">
            Max streak: {streak} days
          </p>
          <div className="grid grid-cols-10 gap-0.5 md:gap-1 justify-center">
            {[...Array(30)].map((_, i) => {
              const date = new Date(Date.now() - (29 - i) * 86400000)
                .toISOString()
                .split("T")[0];
              return (
                <div
                  key={i}
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-300 ${
                    loginLogs.includes(date) ? "bg-green-400" : "bg-gray-700"
                  }`}
                ></div>
              );
            })}
          </div>
          <div className="w-full mt-3 md:mt-4">
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
                style={{ width: `${(totalDays / 30) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {totalDays} / 30 days
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;