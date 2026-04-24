import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-zinc-300" />
            <span className="text-xl font-bold tracking-tighter">AEGO</span>
          </div>
          
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy (POPIA)</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Provider Portal</a>
          </div>
        </div>
        
        <div className="mt-8 text-center md:text-left text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Aego Security Solutions. Durban, South Africa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
