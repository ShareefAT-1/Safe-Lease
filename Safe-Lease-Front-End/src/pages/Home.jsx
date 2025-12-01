import React from "react";
import { motion } from "framer-motion";
import Features from "../components/Features";
import bg from "../assets/pexels-timrael-2474690.jpg";

const Home = () => {
  return (
    <section className="relative text-white overflow-hidden">
      
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50 scale-125"
        style={{ backgroundImage: `url(${bg})` }}
      ></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* ⚪ BUBBLE RISE ANIMATION LAYER */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(28)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-sky-300/30 backdrop-blur-sm border border-white/10 shadow-[0_0_20px_#3b82f6]"
            style={{
              width: Math.random() * 20 + 8,
              height: Math.random() * 20 + 8,
              bottom: "-50px",
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -800 - Math.random() * 300],
              x: [0, Math.sin(i) * 25],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 7 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          ></motion.span>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-14">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2"
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-flex items-center gap-2 py-1 px-4 bg-white/10 rounded-full backdrop-blur-lg border border-white/20 shadow-xl"
          >
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs tracking-wider font-medium">SAFESIGN ENGINE • LIVE</span>
          </motion.div>

          {/* TITLE */}
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[4.8rem] font-black leading-[1.1] tracking-tight drop-shadow-2xl">
            Lease the <motion.span
              className="text-blue-400"
              whileHover={{ textShadow: "0px 0px 15px #60A5FA" }}
            >Future</motion.span>.
            <br />
            Live the <motion.span
              className="text-purple-400"
              whileHover={{ textShadow: "0px 0px 15px #C084FC" }}
            >Smart Way</motion.span>.
          </h1>

          <p className="mt-5 text-gray-300/95 max-w-xl text-lg leading-relaxed font-medium">
            Secure digital contracts, automated payment tracking, and AI-powered verification for 
            landlords and tenants — all in one trusted ecosystem.
          </p>

          {/* BUTTON ROW */}
          <div className="mt-8 flex gap-4 flex-wrap items-center justify-center md:justify-start">
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 0 40px #3b82f6" }}
              whileTap={{ scale: 0.95 }}
              className="px-9 py-3 rounded-full bg-blue-600 font-bold hover:bg-blue-500 transition-all text-sm md:text-base"
            >
              Start Now 🚀
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 0 40px #C084FC" }}
              whileTap={{ scale: 0.95 }}
              className="px-9 py-3 rounded-full bg-white/5 border border-purple-400/40 font-semibold backdrop-blur-xl hover:bg-white/10 transition-all text-sm md:text-base"
            >
              View Demo ✨
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT GLASS PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="w-full md:w-1/2 flex justify-center items-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl hover:shadow-[0_0_60px_#3b82f660] transition-all relative overflow-hidden"
          >

            <h3 className="text-lg font-bold text-blue-300 mb-1 text-center">
              🔹 Active Agreement <span className="text-purple-300">#SL-9982</span>
            </h3>

            <p className="text-xs text-gray-400/90 mb-3 text-center">
              Secure, encrypted and digitally verifiable lease contract
            </p>

            <div className="bg-black/30 p-3 rounded-xl border border-white/10 mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Tenant</span>
                <span className="font-bold text-gray-100">Rahul Sharma</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Rent</span>
                <span className="font-bold text-emerald-400">₹ 26,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Deposit</span>
                <span className="font-bold text-gray-100">₹ 80,000</span>
              </div>
            </div>

            {/* MINI STATS */}
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              {[
                { label: "Start", value: "01 Jan" },
                { label: "Status", value: "On Time", color: "text-emerald-400" },
                { label: "Next Due", value: "01 Dec" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-1.5 text-xs backdrop-blur-lg"
                >
                  <p className="text-gray-500">{stat.label}</p>
                  <p className={`font-black ${stat.color || "text-gray-200"}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.06 }}
              className="w-full py-2 rounded-full bg-blue-500/90 font-bold shadow-lg hover:shadow-[0_0_60px_#3b82f6]"
            >
              Open Dashboard ⚡
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* FEATURES SECTION DROPUP */}
      <motion.div
        initial={{ opacity: 0, y: 90, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mt-16 pb-32"
      >
        <h2 className="text-3xl md:text-4xl font-black tracking-wide mb-10 text-center drop-shadow-[0_0_25px_#9333ea]">
          Why choose <span className="text-blue-400">SafeLease</span>?
        </h2>
        <Features />
      </motion.div>
    </section>
  );
};

export default Home;
