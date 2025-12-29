import React from "react";
import { motion } from "framer-motion";
import bg from "../assets/pexels-timrael-2474690.jpg";   

const featureCards = [
  {
    title: "Secure & Verified Listings",
    text: "Every property and landlord on SafeLease undergoes a verification process to ensure a safer leasing experience.",
    icon: "🔰",
  },
  {
    title: "Transparent Agreements",
    text: "Auto-generated lease agreements with clear terms — both parties must approve before a time-limited PDF is issued.",
    icon: "🧾",
  },
  {
    title: "Connecting Local Communities",
    text: "We support landlords and tenants across local neighborhoods with tools to make leasing fair and fast.",
    icon: "📍",
  },
];

export default function About() {
  return (
    <main className="relative min-h-screen text-gray-100">

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://img.freepik.com/free-photo/mesmerizing-scenery-green-mountains-with-cloudy-sky-surface_181624-27189.jpg?uid=R201428338&ga=GA1.1.944180072.1748070275&semt=ais_hybrid&w=740")',
            transform: "scale(1.15)",        
            filter: "brightness(65%)",        
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />\
      </div>


      <section className="max-w-6xl mx-auto px-6 py-28">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-black/50 backdrop-blur-md rounded-2xl p-12 shadow-xl"
          aria-labelledby="about-title"
        >
          <h1 id="about-title" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
            Discover the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">Peace of Mind</span> with SafeLease
          </h1>

          <p className="mt-6 max-w-3xl text-gray-200/85 leading-relaxed text-lg">
            SafeLease was born to remove friction from renting. We combine secure listings, transparent agreements,
            and two-sided approval workflows so landlords and tenants can sign agreements with confidence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="text-2xl">🧪</div>
              <div>
                <p className="text-sm text-gray-200/90 font-semibold">SafeSign Engine — Bi-party agreement</p>
                <p className="text-xs text-gray-300/80">Auto PDF, time-limited download links, stored securely.</p>
              </div>
            </div>

            <div className="ml-auto flex gap-3">
              <motion.a
                href="/create-property"
                className="inline-block px-5 py-3 rounded-full bg-gradient-to-r from-teal-400 to-indigo-600 text-white font-semibold shadow-lg"
                whileHover={{ scale: 1.03 }}
                aria-label="Create a property"
              >
                Create Property
              </motion.a>

              <motion.a
                href="/properties"
                className="inline-block px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                aria-label="Browse properties"
              >
                Browse Properties
              </motion.a>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {featureCards.map((f, i) => (
            <motion.article
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } },
              }}
              whileHover={{ translateY: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
              className="bg-slate-900/80 p-6 rounded-xl border border-slate-700"
              tabIndex={0}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg text-white">{f.title}</h3>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">{f.text}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
        >
          <div className="bg-black/40 rounded-lg p-6">
            <p className="text-3xl font-bold text-white">1.2k+</p>
            <p className="text-sm text-gray-300">Agreements generated</p>
          </div>
          <div className="bg-black/40 rounded-lg p-6">
            <p className="text-3xl font-bold text-white">98%</p>
            <p className="text-sm text-gray-300">Successful landlord/tenant matches</p>
          </div>
          <div className="bg-black/40 rounded-lg p-6">
            <p className="text-3xl font-bold text-white">50+</p>
            <p className="text-sm text-gray-300">Cities covered</p>
          </div>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.blockquote
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 p-8 rounded-xl border border-slate-700 text-gray-200"
          >
            <p className="text-lg">“SafeLease helped me close my first long-term rental with zero fuss. The agreement flow is brilliant.”</p>
            <footer className="mt-4 text-sm text-gray-400">— Priya, Tenant</footer>
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 text-gray-200"
          >
            <h4 className="font-bold mb-2">How the Agreement Flow works</h4>
            <ol className="list-decimal list-inside text-sm space-y-2 text-gray-300">
              <li>Tenant creates a request for a property with custom values.</li>
              <li>Landlord reviews and either approves or negotiates.</li>
              <li>Once both approve, SafeLease generates a PDF and issues a secure, time-limited download link.</li>
              <li>Agreement stored securely; future signatures & notarization can be added.</li>
            </ol>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
