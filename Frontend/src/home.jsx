import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import CFTracker from "./components/CFtracker";
import EImpacts from "./components/EImpacts";
import About from "./components/About";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const [disableAnim, setDisableAnim] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scrollTo");
    const noAnim = params.get("noAnim") === "true";

    setDisableAnim(noAnim);

    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [location]);

  return (
    <div>
      <Header disableAnim={disableAnim} />
      <CFTracker disableAnim={disableAnim} />
      <EImpacts disableAnim={disableAnim} />
      <About disableAnim={disableAnim} />
      <Footer />
    </div>
  );
};

export default Home;
