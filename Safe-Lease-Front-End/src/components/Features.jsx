import React from "react";

export default function Features() {
  const features = [
    { title: "Verified Agreements", desc: "Digital contracts with legal validity." },
    { title: "Role-Based Access", desc: "Separate dashboards for landlords and tenants." },
    { title: "Easy Payments", desc: "Track and manage lease payments with ease." },
  ];

  return (
    <section className="h-[] pt-20 pb-20 px-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Why Choose <span className="text-blue-600">SafeLease</span>?
      </h2>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto ">
        {features.map((f, idx) => (
          <div
            key={idx} 
            className="bg-blue-100 p-6 rounded-2xl text-center shadow-lg hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
