import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, Globe, CloudLightning, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { PLANS } from '../constants';
import { BillingCycle } from '../types';

const PricingCard = ({ 
  title, 
  price, 
  originalPrice,
  description, 
  features, 
  cycle,
  highlight = false, 
  ctaText = "Get Started",
  ctaLink = "/auth",
  onClick
}: { 
  title: string; 
  price: number; 
  originalPrice?: number;
  description: string; 
  features: string[]; 
  cycle: BillingCycle;
  highlight?: boolean;
  ctaText?: string;
  ctaLink?: string;
  onClick?: () => void;
}) => {
  const cycleText = {
    monthly: '/mo',
    quarterly: '/mo',
    biannual: '/mo',
    yearly: '/mo'
  }[cycle];

  const displayPrice = cycle === 'monthly' ? price : Math.round(price / {
    monthly: 1,
    quarterly: 3,
    biannual: 6,
    yearly: 12
  }[cycle]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative flex flex-col p-10 rounded-[32px] border transition-all duration-500 overflow-hidden ${
        highlight 
          ? 'bg-accent/[0.03] border-accent/30 shadow-[0_20px_50px_rgba(59,130,246,0.15)] ring-1 ring-accent/20' 
          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      }`}
    >
      {highlight && (
        <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}
      {highlight && (
        <div className="absolute top-6 right-6">
          <div className="bg-accent text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl">
            Recommended
          </div>
        </div>
      )}
      
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/40 text-sm font-medium leading-relaxed min-h-[48px]">{description}</p>
      </div>

      <div className="mb-2 flex items-baseline space-x-2">
        <span className="text-6xl font-bold text-white tracking-tight">${displayPrice}</span>
        <span className="text-white/20 text-sm font-bold uppercase tracking-widest">{cycleText}</span>
      </div>
      
      {cycle !== 'monthly' && originalPrice && (
        <div className="mb-8 flex items-center space-x-2">
          <span className="text-xs text-white/20 line-through font-medium">Was ${originalPrice/({quarterly:3, biannual:6, yearly:12}[cycle as any])}</span>
          <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Save {Math.round((1 - (price / originalPrice)) * 100)}%
          </span>
        </div>
      )}
      
      {cycle === 'monthly' && <div className="mb-8 h-4"></div>}

      <div className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start space-x-3 group">
            <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${highlight ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5'}`}>
              <Check className={`w-3 h-3 ${highlight ? 'text-accent' : 'text-white/40'}`} />
            </div>
            <span className="text-sm text-white/60 leading-tight group-hover:text-white/80 transition-colors">{feature}</span>
          </div>
        ))}
      </div>

      {onClick ? (
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          className={`relative z-10 w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] text-center transition-all cursor-pointer ${
            highlight 
              ? 'bg-accent text-slate-950 hover:bg-accent/90 shadow-lg shadow-accent/20' 
              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          {ctaText}
        </button>
      ) : (
        <Link 
          to={ctaLink}
          className={`relative z-10 w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] text-center transition-all ${
            highlight 
              ? 'bg-accent text-slate-950 hover:bg-accent/90 shadow-lg shadow-accent/20' 
              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          {ctaText}
        </Link>
      )}
    </motion.div>
  );
};

export const Pricing = ({ handleUpgrade }: { handleUpgrade: (plan: 'starter' | 'pro' | 'agency', cycle: BillingCycle) => void }) => {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  const cycles: { id: BillingCycle; label: string; savings?: string }[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly', savings: '15%' },
    { id: 'biannual', label: 'Bi-Annual', savings: '25%' },
    { id: 'yearly', label: 'Yearly', savings: '40%' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-accent/20"
        >
          Simple Professional Pricing
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
          Invest in your <span className="text-accent underline decoration-accent/30 decoration-offset-8">local dominance</span>
        </h1>
        <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed mb-16">
          Choose the professional tier that fits your scale. Build massive authority with precision-localized AI content.
        </p>

        {/* Pricing Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            {cycles.map((c) => (
              <button
                key={c.id}
                onClick={() => setCycle(c.id)}
                className={`relative px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  cycle === c.id ? 'text-slate-950' : 'text-white/40 hover:text-white'
                }`}
              >
                {cycle === c.id && (
                  <motion.div
                    layoutId="pricing-pill"
                    className="absolute inset-0 bg-accent rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{c.label}</span>
                  {c.savings && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${cycle === c.id ? 'bg-black/20 text-black' : 'bg-green-500/10 text-green-400'}`}>
                      -{c.savings}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {PLANS.map((plan) => (
          <PricingCard 
            key={plan.id}
            title={plan.name}
            price={plan.price[cycle]}
            originalPrice={plan.price.monthly * (cycle === 'quarterly' ? 3 : cycle === 'biannual' ? 6 : cycle === 'yearly' ? 12 : 1)}
            cycle={cycle}
            description={
              plan.id === 'starter' ? "Perfect for small shops starting with local content." :
              plan.id === 'pro' ? "The standard for growing multi-location local businesses." :
              "Advanced tools for agencies managing multiple client locations."
            }
            features={plan.features}
            highlight={plan.id === 'pro'}
            ctaText={plan.id === 'agency' ? "Get Agency Edge" : plan.id === 'pro' ? "Dominate Local Now" : "Start Growing"}
            onClick={() => {
              console.log(`[Pricing] Upgrading to ${plan.id} with ${cycle} billing`);
              handleUpgrade(plan.id as 'starter' | 'pro' | 'agency', cycle);
            }}
          />
        ))}
      </div>

      {/* Comparison or feature list can go here */}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-t border-white/5">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Fast Setup</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">Ready in 60 seconds</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Secure</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">Powered by Stripe/Paddle</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">localized AI</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">Hyper-local context</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <CloudLightning className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Batch Power</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">Generate 100s of pages</p>
        </div>
      </div>
    </div>
  );
};
