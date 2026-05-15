import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldAlert, Zap, LogIn, UserPlus, CheckCircle2, ChevronRight } from "lucide-react";
import { PlanId } from "../types";

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "guest" | "registered";
  onAuth: (view: "auth" | "pricing") => void;
  generationsUsed: number;
}

export const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, type, onAuth, generationsUsed }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel p-8 rounded-[40px] border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Animated Background Element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 blur-[80px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {type === "guest" ? "Free Limit Reached" : "Usage Limit Reached"}
                </h2>
                <p className="text-white/40 font-medium">
                  {type === "guest" 
                    ? `You've used all ${generationsUsed} visitor generations.`
                    : `You've used all ${generationsUsed} generations included in your free plan.`}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="glass-panel p-4 rounded-3xl border-white/5 bg-white/[0.02]">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4 flex items-center">
                    <Sparkles className="w-3 h-3 mr-2" />
                    How to continue
                  </h4>
                  <ul className="space-y-3">
                    {type === "guest" ? (
                      <>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Create a free account to unlock 10 additional generations
                        </li>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Save and sync your content across devices
                        </li>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Access basic SEO analysis tools
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Upgrade to Pro for 250 generations/month
                        </li>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Full batch generation & export tools
                        </li>
                        <li className="flex items-center text-xs text-white/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-3 flex-shrink-0" />
                          Priority AI processing & support
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {type === "guest" ? (
                  <>
                    <button
                      onClick={() => onAuth("auth")}
                      className="w-full py-4 bg-accent text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Free Account
                    </button>
                    <button
                      onClick={() => onAuth("auth")}
                      className="w-full py-4 bg-white/5 text-white/70 rounded-2xl font-bold uppercase tracking-widest text-[11px] border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In to Existing
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onAuth("pricing")}
                    className="w-full py-4 bg-accent text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
                  >
                    <Zap className="w-4 h-4 mr-2 text-slate-900" />
                    View Pricing Plans
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
