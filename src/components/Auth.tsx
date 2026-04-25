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

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
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
        className="glass-panel p-10 rounded-[32px]"
      >
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight text-center">
          {isSignUp ? "Join the Suite" : "Welcome Back"}
        </h2>
        <p className="text-white/50 text-sm text-center mb-10 font-medium">
          {isSignUp 
            ? "Create an account to save and manage your SEO content." 
            : "Sign in to access your saved articles and dashboard."}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent transition-all text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isSignUp ? "Sign Up" : "Sign In"}</span>}
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
