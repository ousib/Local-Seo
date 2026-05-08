import React from 'react';

interface AdSlotProps {
  position: 'top' | 'sidebar' | 'content' | 'bottom';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = "" }) => {
  const getStyles = () => {
    switch (position) {
      case 'top':
        return 'w-full h-24 mb-8';
      case 'sidebar':
        return 'w-full h-[600px] sticky top-8';
      case 'content':
        return 'w-full h-48 my-10';
      case 'bottom':
        return 'w-full h-32 mt-12';
      default:
        return 'w-full h-24';
    }
  };

  return (
    <div className={`bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group ${getStyles()} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1 relative z-10">Advertisement</div>
      <div className="text-[9px] text-white/10 font-mono relative z-10">AdSense Placement: {position}</div>
      <div className="absolute top-2 right-3 text-[8px] text-white/5 font-bold uppercase">Sponsored</div>
    </div>
  );
};
