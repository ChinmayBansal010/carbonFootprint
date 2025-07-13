import React from "react";
import dl from "../assets/dl.jpg";
import cb from "../assets/cb.jpg";
import {motion} from "motion/react"

const team = [
  {
    name: "Daksh Lohchab",
    role: "Web Development Head",
    img: dl,
    college: "Delhi Technological University (DTU)",
    course: "B.Tech Electrical Engineering",
    animation: "animate-float-updown",
  },
  {
    name: "Chinmay Bansal",
    role: "AI/ML Head",
    img: cb,
    college: "Manav Rachna International Institute of research and studies",
    course: "B.Tech CSE AIML",
    animation: "animate-float-updown-delay",
  },
];

// Custom keyframes for gentle up-down floating animation
const style = `
@keyframes float-updown {
  0%, 100% { transform: translateY(0);}
  50% { transform: translateY(-18px);}
}
@keyframes float-updown-delay {
  0%, 100% { transform: translateY(0);}
  50% { transform: translateY(-12px);}
}
.animate-float-updown {
  animation: float-updown 3s ease-in-out infinite;
}
.animate-float-updown-delay {
  animation: float-updown-delay 3s ease-in-out infinite;
}
`;

const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 200 }}
      transition={{ duration: 1}}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] py-10 px-2"
      id="About"
    >
      <style>{style}</style>
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 text-center drop-shadow-[0_4px_24px_rgba(0,255,180,0.25)] tracking-tight">
        Meet Our Team
      </h1>
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-3xl">
        {team.map((member, idx) => (
  <div
    key={idx}
    className="bg-[#181c23] bg-opacity-90 min-h-[370px] rounded-2xl shadow-2xl p-6 flex flex-col items-center w-80 md:w-96 hover:scale-105 transition-transform duration-300 border border-[#2af598]/20"
    style={{
      boxShadow:
        "0 4px 32px 0 rgba(42,245,152,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.25)",
    }}
  >
    <div
      className={`bg-gradient-to-br from-[#2af598] via-[#009efd] to-[#181c23] rounded-full shadow-lg p-1.5 mb-4 ${member.animation}`}
      style={{
        boxShadow:
          "0 0 24px 0 rgba(42,245,152,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.25)",
      }}
    >
      {member.name === "Daksh Lohchab" ? (
        <a
          href="https://www.linkedin.com/in/daksh-lohchab-10a431324"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={member.img}
            alt={member.name}
            className="w-28 h-28 rounded-full object-contain bg-[#232526] border-4 border-[#2af598]/40"
            draggable={false}
          />
        </a>
      ) : member.name === "Chinmay Bansal" ? (
        <a
          href="https://www.linkedin.com/in/xenoryx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={member.img}
            alt={member.name}
            className="w-28 h-28 rounded-full object-contain bg-[#232526] border-4 border-[#2af598]/40"
            draggable={false}
          />
        </a>
      ) : (
        <img
          src={member.img}
          alt={member.name}
          className="w-28 h-28 rounded-full object-contain bg-[#232526] border-4 border-[#2af598]/40"
          draggable={false}
        />
      )}
    </div>
    <div className="text-2xl font-bold text-[#2af598] mb-1 text-center tracking-wide">
      {member.name}
    </div>
    <div className="text-lg text-[#009efd] font-semibold mb-1 text-center">
      {member.role}
    </div>
    {member.college && (
      <div className="text-base text-gray-200 text-center mb-0.5">
        {member.college}
      </div>
    )}
    {member.course && (
      <div className="text-base text-gray-400 text-center">
        {member.course}
      </div>
    )}
  </div>
        ))}
      </div>
    </motion.div>
  );
};

export default About;
