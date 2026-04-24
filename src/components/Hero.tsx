import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export default function Hero({ onBookClick }: { onBookClick: () => void }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2070&auto=format&fit=crop" 
          alt="Security Professional" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-zinc-700 text-zinc-300 text-xs font-medium uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Durban's Premier Security E-Hailing</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              On-Demand <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                Protection.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl leading-relaxed">
              Connect instantly with vetted security professionals for close protection, events, and asset security. No long-term contracts. Just reliable safety when you need it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-full transition-all group"
              >
                Request Security Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium rounded-full transition-all"
              >
                View Services
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
