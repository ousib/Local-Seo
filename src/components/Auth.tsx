import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "motion/react";
import { Mail, Lock, Loader2, ArrowLeft, Github, Chrome } from "lucide-react";

interface AuthProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function Auth({ onBack, onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (supabase.auth.getSession === undefined || (import.meta.env.VITE_SUPABASE_URL || "").includes("placeholder")) {
      setError("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
      setLoading(false);
      return;
    }

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError("Network error: Could not reach Supabase. Check your Supabase URL and Internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <button 
        onClick={onBack}
        className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card"
      >
        <h2 className="text-4xl font-display font-bold text-white mb-3 tracking-tight text-center headline-gradient leading-tight">
          {isSignUp ? "Create Your Suite" : "Elite Access"}
        </h2>
        <p className="text-white/40 text-base text-center mb-12 font-medium leading-relaxed max-w-[280px] mx-auto">
          {isSignUp 
            ? "Secure your professional SEO engine and start scaling." 
            : "Authorized personnel login. Access your business dashboard."}
        </p>

        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] ml-2 block">Corporate Identity</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
              <input 
                type="email"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-accent transition-all text-base placeholder:text-white/10"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] ml-2 block">Security Token</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
              <input 
                type="password"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-accent transition-all text-base placeholder:text-white/10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-slate-950 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent-soft hover:translate-y-[-2px] transition-all duration-300 shadow-xl shadow-accent/20 flex items-center justify-center space-x-3 disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isSignUp ? "Initialize Account" : "Access Console"}</span>}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-white/40 hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up Free"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
