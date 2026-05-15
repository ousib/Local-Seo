import React from "react";
import { motion } from "motion/react";
import { Zap, Target, Calendar, ArrowUpRight, BarChart3 } from "lucide-react";
import { UserUsage, PlanDetails } from "../types";
import { PLANS } from "../constants";

interface UsageStatsProps {
  usage: UserUsage;
  onUpgrade: () => void;
}

export const UsageStats: React.FC<UsageStatsProps> = ({ usage, onUpgrade }) => {
  const plan = PLANS.find(p => p.id === usage.currentPlan) || {
    id: 'free',
    name: 'Free Plan',
    limits: { generations: 10, businesses: 0 }
  };

  const genPercent = Math.min(100, (usage.generationsUsed / usage.generationLimit) * 100);
  const bizPercent = Math.min(100, (usage.businessesUsed / usage.businessLimit) * 100);

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 90) return "bg-orange-500";
    if (percent >= 70) return "bg-yellow-500";
    return "bg-accent";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Plan Card */}
      <div className="glass-panel p-6 rounded-[32px] border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-12 h-12 text-accent" />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Current Plan</div>
          <div className="flex items-center space-x-3 mb-6">
            <h3 className="text-2xl font-bold text-white leading-none">{plan.name}</h3>
            {usage.currentPlan === 'free' && (
              <span className="px-2 py-0.5 bg-white/10 text-white/40 text-[8px] font-bold uppercase tracking-widest rounded-md">Limit Active</span>
            )}
          </div>
          <button 
            onClick={onUpgrade}
            className="flex items-center text-accent text-[10px] font-bold uppercase tracking-widest hover:underline group"
          >
            {usage.currentPlan === 'free' ? "Unlock Pro Features" : "Manage Subscription"}
            <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Generations Usage */}
      <div className="glass-panel p-6 rounded-[32px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Generation Usage</div>
          <div className="text-[10px] font-bold text-white/60">
            {usage.generationsUsed} / {usage.generationLimit}
          </div>
        </div>
        <div className="mb-4">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${genPercent}%` }}
              className={`h-full ${getStatusColor(genPercent)} shadow-[0_0_10px_rgba(76,201,240,0.3)]`}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[10px] font-bold text-white/20 uppercase tracking-tighter">
            <BarChart3 className="w-3 h-3 mr-1.5" />
            {100 - Math.floor(genPercent)}% Remaining
          </div>
          {genPercent >= 70 && (
            <div className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider animate-pulse">
              Low Credits
            </div>
          )}
        </div>
      </div>

      {/* Subscription Info */}
      <div className="glass-panel p-6 rounded-[32px] border-white/5">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Billing Info</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-white/60 font-medium">
              <Calendar className="w-3.5 h-3.5 mr-2 text-white/20" />
              Renews on
            </div>
            <div className="text-xs text-white font-bold">{new Date(usage.renewalDate).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-white/60 font-medium">
              <Target className="w-3.5 h-3.5 mr-2 text-white/20" />
              Cycle
            </div>
            <div className="text-xs text-white font-bold capitalize">{usage.billingCycle}</div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Growth Engine Status</div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-bold text-green-500 uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
