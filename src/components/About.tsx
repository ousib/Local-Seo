import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Users, 
  Zap, 
  ShieldCheck, 
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Store,
  Clock
} from "lucide-react";

interface AboutProps {
  onBack: () => void;
}

export default function About({ onBack }: AboutProps) {
  const benefits = [
    {
      icon: <Target className="w-6 h-6 text-accent" />,
      title: "Local Precision",
      description: "Our AI understands local markers, neighborhoods, and regional nuances that generic AI misses."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      title: "SEO Optimized",
      description: "Every article is built with schema markup, meta data, and internal linking structures out of the box."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-accent" />,
      title: "Drive MRR",
      description: "Rank higher for high-intent keywords in your local area to drive real business growth."
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      title: "Local Authority",
      description: "Establish your business as the go-to expert in your specific city and industry."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 relative z-10">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to App
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/30 mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          The Future of Local SEO
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-8 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent leading-tight">
          Empowering Local Businesses with <br />
          <span className="text-accent underline decoration-accent/30 decoration-offset-8">Expert-Level SEO</span>
        </h1>
        <p className="text-lg text-white/60 font-medium leading-relaxed mb-16 max-w-2xl">
          We built this platform to level the playing field. Small businesses shouldn't need a $5,000/month SEO agency budget just to show up on page one of Google.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {benefits.map((benefit, index) => (
          <motion.div 
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-panel p-8 rounded-3xl hover:border-accent/30 transition-all group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{benefit.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-panel rounded-[40px] p-12 bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 overflow-hidden relative"
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">Why Subscribe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              "Unlimited High-Quality Articles",
              "Priority AI Processing",
              "Bulk Content Engine (Batch Mode)",
              "Google Maps Embed Generator",
              "Advanced JSON-LD Schema",
              "One-Click Webhook Exporting",
              "Custom Brand Voice Tuning",
              "Unlimited Local Keywords"
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-white/80 font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button 
              onClick={() => onBack()} // In a real app, this would go to upgrade
              className="w-full sm:w-auto px-10 py-5 bg-accent text-slate-950 rounded-2xl font-bold uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg text-sm"
            >
              Start Generating Now
            </button>
            <div className="flex items-center text-white/40 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 mr-2" />
              14-Day Money Back Guarantee
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      <div className="mt-24 pt-24 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
            <Store className="w-5 h-5 text-accent" />
            <h4 className="text-white font-bold tracking-tight">Small Business First</h4>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-medium">Built specifically for the needs of local store owners and service providers, not bloated corporate agencies.</p>
        </div>
        <div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
            <Clock className="w-5 h-5 text-accent" />
            <h4 className="text-white font-bold tracking-tight">Instant Delivery</h4>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-medium">What used to take an agency weeks, our AI does in 45 seconds. Scale your content without the wait.</p>
        </div>
        <div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h4 className="text-white font-bold tracking-tight">Growth Focused</h4>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-medium">We don't just generate text; we generate revenue opportunities through search engine dominance.</p>
        </div>
      </div>
    </div>
  );
}
