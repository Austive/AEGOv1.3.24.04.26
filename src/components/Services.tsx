import React from 'react';
import { motion } from 'motion/react';
import { UserCheck, CalendarDays, Home } from 'lucide-react';

const services = [
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: "Close Protection",
    price: "R1,200",
    unit: "per hour",
    description: "Personalized security for high-net-worth individuals, executives, and VIPs requiring discreet, professional protection.",
    features: ["PSIRA Registered Bodyguards", "Threat Assessment", "Secure Transportation Routing"]
  },
  {
    icon: <CalendarDays className="w-8 h-8" />,
    title: "Event Security",
    price: "R800",
    unit: "per hour",
    description: "Comprehensive security management for private gatherings, corporate events, and high-profile functions.",
    features: ["Crowd Control", "Access Management", "Emergency Response Planning"]
  },
  {
    icon: <Home className="w-8 h-8" />,
    title: "Asset & Home",
    price: "R600",
    unit: "per hour",
    min: "Min. 4 hours",
    description: "Reliable protection for luxury properties, real estate showings, and valuable assets.",
    features: ["Perimeter Securing", "Access Control", "Incident Reporting"]
  }
];

export default function Services({ onBookClick }: { onBookClick: () => void }) {
  return (
    <section id="services" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Flexible Security Solutions</h2>
            <p className="text-zinc-400">Transparent, one-time fees. No long-term contracts. Request exactly what you need, when you need it.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col p-8 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-white/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
                {React.cloneElement(service.icon as React.ReactElement, { className: 'w-32 h-32' })}
              </div>
              
              <div className="text-zinc-300 mb-6">
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
              <p className="text-zinc-400 text-sm mb-6 flex-grow">{service.description}</p>
              
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={onBookClick}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-white hover:text-zinc-950 text-white font-medium transition-colors mt-auto"
              >
                Request Service
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
