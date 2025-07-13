import React from "react";
import { Link as ScrollLink } from "react-scroll";

const Footer = () => (
  <footer className="bg-black text-gray-300 py-6">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-center md:text-left text-sm">
        © {new Date().getFullYear()} C-FootPrinter. All rights reserved.
      </div>
      <div className="flex gap-4 text-sm">
        <ScrollLink
          to="Header"
          smooth={true}
          duration={600}
          offset={-80} // adjust if you have a fixed navbar
          className="transition hover:text-green-400 cursor-pointer"
        >
          Home
        </ScrollLink>
        <ScrollLink
          to="About"
          smooth={true}
          duration={600}
          offset={-80} // adjust if you have a fixed navbar
          className="transition hover:text-green-400 cursor-pointer"
        >
          About Us
        </ScrollLink>
        <ScrollLink
          to="EImpacts"
          smooth={true}
          duration={600}
          offset={-80} // adjust if you have a fixed navbar
          className="transition hover:text-green-400 cursor-pointer"
        >
          Environment Impacts
        </ScrollLink>
        <ScrollLink
          to="CFTracker"
          smooth={true}
          duration={600}
          offset={-80} // adjust if you have a fixed navbar
          className="transition hover:text-green-300 cursor-pointer"
        >
          Carbon Footprint Tracker
        </ScrollLink>
      </div>
      <div className="text-center md:text-right text-xs text-gray-500">
        Made with <span className="text-green-400">♥</span> by the C-FootPrinter
        Team
      </div>
    </div>
  </footer>
);

export default Footer;
