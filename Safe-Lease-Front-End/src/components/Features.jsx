import React from "react";

export default function Features() {
  const features = [
    { title: "Verified Agreements", desc: "Digital contracts with legal validity." },
    { title: "Role-Based Access", desc: "Separate dashboards for landlords and tenants." },
    { title: "Easy Payments", desc: "Track and manage lease payments with ease." },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Why Choose SafeLease?</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((f, idx) => (
          <div key={idx} className="bg-blue-100 p-6 rounded-xl text-center shadow-sm">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
