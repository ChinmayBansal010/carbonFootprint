import React from "react";
import ei1 from "../assets/ei1.jpg";
import ei2 from "../assets/ei2.jpg";
import ei3 from "../assets/ei3.jpg";
import ei4 from "../assets/ei4.jpg";
import ei5 from "../assets/ei5.png";
import ei6 from "../assets/ei6.jpg";
import {motion} from "motion/react"

const EImpacts = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x:-200 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row items-stretch max-w-6xl mx-auto bg-gradient-to-br from-green-50 via-blue-50 to-white rounded-2xl shadow-2xl overflow-hidden my-12"
      id="EImpacts"
    >
      {/* Left: Images */}
      <div className="md:w-1/2 flex flex-col gap-6 justify-center items-center bg-gradient-to-b from-green-200/60 to-blue-200/60 p-6">
        {/* Show only the first image on mobile, all images on desktop */}
        <img
          src={ei1}
          alt="Nature Impact 1"
          className="rounded-xl shadow-lg object-cover w-full max-h-64 mb-2"
        />
        <div className="hidden md:flex flex-col gap-6 w-full">
          <img
            src={ei2}
            alt="Nature Impact 2"
            className="rounded-xl shadow-lg object-cover w-full max-h-64"
          />
          <img
            src={ei3}
            alt="Nature Impact 3"
            className="rounded-xl shadow-lg object-cover w-full max-h-64"
          />
          <img
            src={ei4}
            alt="Nature Impact 4"
            className="rounded-xl shadow-lg object-cover w-full max-h-64"
          />
          <img
            src={ei5}
            alt="Nature Impact 5"
            className="rounded-xl shadow-lg object-cover w-full max-h-64"
          />
          <img
            src={ei6}
            alt="Nature Impact 6"
            className="rounded-xl shadow-lg object-cover w-full max-h-64"
          />
        </div>
      </div>
      {/* Right: Text */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white/90">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-6 drop-shadow-lg">
          Environmental Impacts
        </h1>
        <section className="space-y-6 text-gray-800 text-lg md:text-xl leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              🌍 The Hidden Cost of Everyday Choices
            </h2>
            <p>
              Every action we take — whether it's flipping a light switch,
              ordering takeout, or streaming a video — leaves a trace on our
              planet. These traces are small on their own, but when multiplied
              by billions of people, they shape the very climate and health of
              our world.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-1">
              💨 Invisible Emissions
            </h3>
            <p>
              When you drive a car or take a flight, it's not just fuel you burn
              — it's a ripple you send into the atmosphere. Carbon dioxide, a
              colorless gas, wraps around the Earth like an invisible blanket,
              slowly trapping heat and shifting weather patterns that once
              sustained life in balance.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-1">
              🏞️ Vanishing Green
            </h3>
            <p>
              Forests are not just "trees" — they are breathing ecosystems that
              inhale carbon and exhale life. Our appetite for land, paper, and
              meat has led to forests being erased faster than they can regrow.
              With them go species, rain patterns, and nature’s ability to heal.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-700 mb-1">
              🌊 Oceans at the Edge
            </h3>
            <p>
              Each plastic bag or bottle tossed carelessly finds its way to
              oceans — turning pristine waters into slow-moving graveyards for
              marine life. Rising carbon levels also acidify the sea, dissolving
              coral reefs silently beneath the surface — the underwater
              rainforests of our planet.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-red-700 mb-1">
              🔥 The Earth’s Fever
            </h3>
            <p>
              What we once called "summer" is turning into heatwaves. Glaciers
              that took thousands of years to form are now melting within
              decades. Droughts and floods no longer belong to fiction — they
              are the new weather forecast.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-yellow-700 mb-1">
              🗑️ Waste Without Witness
            </h3>
            <p>
              Out of sight is not out of existence. Every product we throw
              "away" still exists — in landfills, oceans, or smoke. E-waste
              leaks toxins into the soil. Food waste releases methane, a gas
              even more potent than CO₂.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-200 via-blue-200 to-green-100 rounded-xl p-6 mt-6 shadow-lg">
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              🚨 The Wake-Up Call
            </h2>
            <p>
              You are not just a user of the Earth — you are a part of it. The
              good news? Every mindful decision, no matter how small, helps
              rewrite the future.{" "}
              <span className="font-bold text-blue-700">
                Awareness is the first step. Action is the next.
              </span>{" "}
              Let’s stop measuring progress only by speed and start measuring it
              by sustainability.
            </p>
            <div className="mt-4 text-center">
              <span className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition text-lg">
                Start Your Sustainable Journey Today!
              </span>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default EImpacts;
