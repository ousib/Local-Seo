import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export const Contact: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 text-accent hover:underline flex items-center"
        >
          &larr; Back to Home
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-10 rounded-3xl">
            <h1 className="text-3xl font-bold mb-6">Get in Touch</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              Have questions about our AI SEO generator or need help with your enterprise subscription? Our team is here to help you dominate local search.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Email</div>
                  <div className="text-sm font-medium">support@local-seo-suite.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Office</div>
                  <div className="text-sm font-medium">San Francisco, CA 94103</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-3xl border border-accent/20">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button className="w-full bg-accent text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/90 transition-all flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
