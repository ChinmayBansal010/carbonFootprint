import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";

const EDProfile = () => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) return console.error("Error fetching user:", error.message);

      if (user) {
        setName(user.user_metadata?.name || "");
        setCountry(user.user_metadata?.country || "");
        setAvatarUrl(user.user_metadata?.avatar_url || "");
        setNickname(user.user_metadata?.nickname || "");
        setPhone(user.user_metadata?.phone || "");
        setHobbies(user.user_metadata?.hobbies || "");
        setEmail(user.email || "");
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Image upload failed: " + uploadError.message);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl.publicUrl);
    toast.success("Profile picture updated!");
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.warning("Name and email are required.");
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return toast.error("Error: " + error.message);

    const updates = {
      name,
      country,
      avatar_url: avatarUrl,
      nickname,
      phone,
      hobbies,
    };

    const { error: updateError } = await supabase.auth.updateUser({
      email,
      data: updates,
    });

    if (updateError) {
      toast.error("Failed to update profile: " + updateError.message);
    } else {
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1e1e2f]/90 backdrop-blur-md border border-[#2af598]/20 rounded-3xl w-full max-w-3xl p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.25)] space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-[#2af598] drop-shadow-md">
            ✨ Edit Your Profile
          </h2>
          <p className="text-sm text-gray-400">
            Customize your public profile information
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative group w-28 h-28">
            {avatarUrl ? (
              <motion.img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-[#2af598] shadow-lg bg-[#232526] cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={() => document.getElementById("avatarInput").click()}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center rounded-full border-4 border-[#2af598] bg-[#232526] text-white text-sm font-medium shadow-lg cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={() => document.getElementById("avatarInput").click()}
              >
                Avatar
              </div>
            )}

            {/* Camera icon overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition"
              onClick={() => document.getElementById("avatarInput").click()}
            >
              <FaCamera className="text-xl text-[#2af598]" />
            </div>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <span className="text-xs text-gray-400 mt-2">
            Click avatar to update picture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Name *", value: name, setter: setName, type: "text" },
            {
              label: "Country (optional)",
              value: country,
              setter: setCountry,
              type: "text",
            },
            { label: "Email *", value: email, setter: setEmail, type: "email" },
            {
              label: "Phone (optional)",
              value: phone,
              setter: setPhone,
              type: "tel",
            },
            {
              label: "Nickname (optional)",
              value: nickname,
              setter: setNickname,
              type: "text",
            },
          ].map((field, idx) => (
            <div key={idx} className="space-y-1">
              <label className="block text-sm text-[#2af598]/80 font-medium">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder || ""}
                className="w-full p-3 bg-[#2a2a3b] rounded-xl border border-[#2af598]/20 focus:outline-none focus:ring-2 focus:ring-[#2af598] text-sm"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#2af598]/80">
            Hobbies (optional)
          </label>
          <textarea
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            rows="3"
            className="w-full p-3 bg-[#2a2a3b] rounded-xl border border-[#2af598]/20 focus:outline-none focus:ring-2 focus:ring-[#2af598] text-sm"
          ></textarea>
        </div>

        <div className="flex justify-between items-center gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#2af598]/50 bg-[#1c1c2a] text-[#2af598] hover:bg-[#2a2a3b] transition font-medium"
          >
            ← Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-[#2af598] to-[#009efd] text-white rounded-full font-semibold shadow-md hover:shadow-lg transition"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default EDProfile;
