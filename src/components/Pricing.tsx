import React from 'react';
import { Check, Sparkles, Zap, Shield, Globe, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  highlight = false, 
  ctaText = "Get Started",
  ctaLink = "/auth",
  onClick
}: { 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  highlight?: boolean;
  ctaText?: string;
  ctaLink?: string;
  onClick?: () => void;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative flex flex-col p-8 rounded-[32px] border transition-all ${
      highlight 
        ? 'bg-accent/5 border-accent shadow-[0_0_40px_rgba(76,201,240,0.1)]' 
        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
    }`}
  >
    {highlight && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-slate-950 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
        Most Popular
      </div>
    )}
    
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{description}</p>
    </div>

    <div className="mb-8 flex items-baseline space-x-1">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-white/20 text-sm font-medium">/month</span>
    </div>

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
          console.log("Pricing button clicked for:", title);
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

export const Pricing = ({ handleUpgrade }: { handleUpgrade: (plan: 'starter' | 'pro' | 'agency') => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-accent/20"
        >
          Simple & Transparent Pricing
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Invest in your <span className="text-accent italic">local dominance</span>
        </h1>
        <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
          Choose the plan that fits your business stage. From solo entrepreneurs to regional powerhouses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <PricingCard 
          title="Starter"
          price="29"
          description="Perfect for new businesses testing the waters with local content."
          features={[
            "10 AI Articles per month",
            "Location-specific optimizations",
            "Markdown & HTML exports",
            "Basic SEO metadata",
            "Email support"
          ]}
          ctaText="Get Started"
          onClick={() => handleUpgrade('starter')}
        />
        <PricingCard 
          title="Professional"
          price="79"
          highlight={true}
          description="Designed for businesses ready to scale and dominate local search."
          features={[
            "50 AI Articles per month",
            "Unlimited Batch generation",
            "Advanced Maps & Schema integration",
            "Webhook & Zapier automation",
            "Priority AI queue",
            "Priority support"
          ]}
          ctaText="Dominate Now"
          onClick={() => handleUpgrade('pro')}
        />
        <PricingCard 
          title="Agency"
          price="199"
          description="Build out high-authority local networks for multiple clients."
          features={[
            "Unlimited AI Articles",
            "White-label export options",
            "Multi-user dashboard access",
            "API endpoint access",
            "Dedicated account manager",
            "Custom local knowledge base"
          ]}
          ctaText="Contact Sales"
          onClick={() => handleUpgrade('agency')}
        />
      </div>

      {/* Trust Badges */}
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
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">256-bit Encryption</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Localized</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">98.4% Accuracy</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group hover:border-accent transition-colors">
            <CloudLightning className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Cloud Sync</h4>
          <p className="text-white/30 text-xs font-medium uppercase tracking-tighter">Instant access</p>
        </div>
      </div>

      {/* FAQ Sneak Peek */}
      <div className="mt-20 max-w-3xl mx-auto glass-panel p-10 rounded-[40px] text-center border-white/5">
        <h3 className="text-2xl font-bold text-white mb-4">Can I cancel anytime?</h3>
        <p className="text-white/40 text-sm font-medium mb-8">Yes, you can cancel your subscription at any time from your billing dashboard. No hidden fees, no long-term contracts.</p>
        <button onClick={() => window.location.href='/help'} className="text-accent font-bold uppercase tracking-widest text-[10px] hover:underline">View all FAQs</button>
      </div>
    </div>
  );
};
