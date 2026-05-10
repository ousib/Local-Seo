import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  FileText, 
  MapPin, 
  Share2, 
  Zap, 
  HelpCircle,
  ArrowRight,
  Database,
  SearchCode
} from 'lucide-react';

export const Help: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Step 1: Input Business Details",
      description: "Start by entering your business name, industry, and the specific location you want to target (e.g., San Francisco, CA). AI uses this to anchor your content locally."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Step 2: Choose Your Topic",
      description: "Select a topic relevant to your services. Our AI will analyze high-intent keywords for that industry and location to ensure your content addresses real search queries."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Step 3: Generate Content",
      description: "Click 'Generate' and watch the AI build a high-conversion SEO article. It automatically includes meta titles, meta descriptions, FAQ schema, and internal linking suggestions."
    },
    {
      icon: <SearchCode className="w-6 h-6" />,
      title: "Step 4: Review SEO Signals",
      description: "Check the 'SEO Verified' panel for technical optimizations. Ensure the Google Maps embed is targeting the correct area and that the Schema markup is ready for deployment."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Step 5: Publish & Share",
      description: "Copy the generated markdown to your CMS (WordPress, Webflow, etc.) and use our social share buttons to instantly distribute your new local asset."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 text-accent hover:underline flex items-center group font-bold text-xs uppercase tracking-widest"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Platform Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            How to Use Local Seo Machine
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Master local search engine optimization in five simple steps. Our platform handles the technical heavy lifting so you can focus on your business.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 rounded-3xl flex items-start space-x-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-slate-950 transition-all">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 glass-panel p-10 rounded-[40px] text-center border-accent/20 border">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Dominate Local Search?</h2>
          <p className="text-white/40 mb-8 max-w-lg mx-auto leading-relaxed">
            Start generating content today and watch your local business climb the search rankings. No SEO agency requried.
          </p>
          <button 
            onClick={onBack}
            className="px-10 py-4 bg-accent text-slate-950 font-bold rounded-2xl uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20"
          >
            Go to Generator
          </button>
        </div>
      </div>
    </div>
  );
};
