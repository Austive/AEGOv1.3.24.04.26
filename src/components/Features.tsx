import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Lock, Zap, ShieldAlert } from 'lucide-react';

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Precision Geofencing",
    description: "Advanced location tracking ensures security personnel are dispatched to your exact coordinates instantly."
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Strict Privacy",
    description: "POPIA compliant data handling. Your personal information and security needs are kept strictly confidential."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rapid Response",
    description: "Our e-hailing algorithm matches you with the closest available vetted professionals for immediate deployment."
  },
  {
    icon: <ShieldAlert className="w-6 h-6" />,
    title: "Vetted Professionals",
    description: "All personnel are PSIRA registered, rigorously vetted, and continuously evaluated for top-tier service."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Uncompromising Standards</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Built on a foundation of technology, privacy, and rapid response to meet the demands of Durban's dynamic environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-white/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
