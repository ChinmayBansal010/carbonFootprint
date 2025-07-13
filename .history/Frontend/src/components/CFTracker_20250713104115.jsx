import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../supabaseClient";
import cf from "../assets/cf.jpg";
import.meta.env.VITE_API_URL

// Access Recorder from global (attached via public/index.html script)
const Recorder = window.Recorder;

const CFTracker = ({ user }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hi! Ask me about your carbon footprint. For example: 'I drove 10 km by car and ate 0.5 kg chicken today.'",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastInput, setLastInput] = useState("");
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_name")
        .eq("user_id", user.id);
      if (!error && data) {
        setEarnedBadges(data.map((b) => b.badge_name));
      }
    };
    fetchUserBadges();
  }, [user]);

  const saveBadgeToSupabase = async (userId, badgeName) => {
    try {
      const { error } = await supabase
        .from("user_badges")
        .insert([{ user_id: userId, badge_name: badgeName }]);
      if (error) console.error("Supabase Insert Error:", error.message);
    } catch (err) {
      console.error("Failed to save badge to Supabase", err);
    }
  };

  const processUserInput = async (inputText) => {
    if (!inputText.trim()) return;

    setLastInput(inputText);
    setChatHistory((prev) => [...prev, { sender: "user", text: inputText }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/calculate`,
        { user_input: inputText },
        { timeout: 5000 }
      );

      let botReply = "";
      if (res.data && !res.data.error) {
        const breakdownEntries = Object.entries(
          res.data.category_percentages || {}
        ).filter(([, val]) => val !== 0);

        const newBadges = (res.data.badges || []).filter(
          (badge) => !earnedBadges.includes(badge)
        );

        newBadges.forEach((badge) => {
          toast.success(`🏅 You earned the "${badge}" badge!`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          if (user) saveBadgeToSupabase(user.id, badge);
        });

        if (newBadges.length > 0) {
          setEarnedBadges((prev) => [...prev, ...newBadges]);
        }

        if (
          Number(res.data.total_emission) === 0 ||
          breakdownEntries.length === 0
        ) {
          botReply = "🎉 Zero carbon emission. Nice job!";
        } else {
          botReply =
            `🌱 Your total carbon emission: ${res.data.total_emission} kg CO₂\n\nBreakdown:\n` +
            breakdownEntries
              .map(
                ([cat, val]) =>
                  `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${val}%`
              )
              .join("\n");

          if (res.data.tips?.length > 0) {
            botReply += `\n\n💡 Tips:\n${res.data.tips.join("\n")}`;
          }
        }
      } else {
        botReply =
          res.data?.error ||
          "Sorry, I couldn't process your request. Please try again!";
      }

      setChatHistory((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("API Error:", err);
      let errorMsg = "Error connecting to the server. Please try again later.";
      if (err.response) {
        errorMsg = err.response.data?.error || errorMsg;
      } else if (err.request) {
        errorMsg = "No response from server. Please check your connection.";
      }
      setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
    } finally {
      setLoading(false);
      setChatInput("");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const input = audioContextRef.current.createMediaStreamSource(stream);
      recorderRef.current = new Recorder(input, { numChannels: 1 });
      recorderRef.current.record();

      setRecording(true);
      toast.info("🎤 Recording started... Speak now!");
    } catch (error) {
      console.error("Recorder.js Error:", error);
      toast.error("Recording failed to start.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current.exportWAV(async (blob) => {
        setRecording(false);
        toast.info("🛑 Recording stopped. Processing...");

        const formData = new FormData();
        formData.append("audio", blob, "speech.wav");

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/recognize`, {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (result.text) {
            setChatInput(result.text);
            toast.info(`🗣️ You said: "${result.text}"`);
            await processUserInput(result.text);
          } else {
            toast.error(result.error || "Speech not recognized.");
          }
        } catch (error) {
          console.error("Recognition error:", error);
          toast.error("Failed to recognize audio.");
        }
      });
    }
  };

  const handleDownloadReport = async () => {
    if (!lastInput) return;
    try {
      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/download-report`,
  { user_input: lastInput },
  { responseType: "blob", timeout: 5000 }
);

      const blob = new Blob([res.data], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "carbon_report.txt";
      link.click();
    } catch (err) {
      toast.error("Failed to download report. Please try again.");
      console.error("Download Error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5 }}
      className="flex flex-col md:flex-row items-center justify-center gap-15 py-12 px-4 md:px-16 md:gap-10 bg-white/80 rounded-2xl shadow-lg max-w-6xl mx-auto"
      id="CFTracker"
    >
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={cf}
          alt="Carbon Footprint"
          className="rounded-xl shadow-lg max-h-96 object-cover w-full md:w-auto"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
          What is a carbon footprint?
        </h1>
        <p className="text-gray-800 text-lg md:text-xl leading-relaxed bg-white/70 rounded-xl p-6 shadow">
          Every action we take leaves behind a trail of greenhouse gases — from
          the meals we eat to the way we travel — forming what’s known as our
          carbon footprint. In the United States, this personal impact averages
          a staggering 16 tons of emissions per person each year, which far
          exceeds the global average of about 4 tons...
        </p>

        <div className="mt-10 w-full">
          <div className="bg-white/90 rounded-xl shadow p-6 max-h-[28rem] overflow-y-auto mb-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className="mb-3">
                <div
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`px-5 py-3 rounded-2xl inline-block max-w-[85%] text-base md:text-lg ${
                      msg.sender === "user"
                        ? "bg-green-100 text-green-900"
                        : "bg-blue-100 text-blue-900"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.text}
                  </span>
                </div>
                {msg.sender === "bot" &&
                  idx === chatHistory.length - 1 &&
                  !loading &&
                  lastInput && (
                    <div className="flex justify-start mt-2 ml-2">
                      <button
                        onClick={handleDownloadReport}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:scale-105 transition"
                      >
                        📄 Download My Report
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              processUserInput(chatInput);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Type your activity (e.g., 'I drove 10 km by car')"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-8 py-3 rounded-full shadow hover:scale-105 transition text-base md:text-lg"
                disabled={loading}
              >
                {loading ? "..." : "Send"}
              </button>
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`w-full sm:w-auto px-4 py-2 rounded-full text-white ${
                  recording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {recording ? "🛑 Stop" : "🎙️ Speak"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default CFTracker;
