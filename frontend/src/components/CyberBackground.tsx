import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle architectural dot grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Soft top ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-indigo-500/5 blur-[120px] rounded-full" />
    </div>
  );
};
