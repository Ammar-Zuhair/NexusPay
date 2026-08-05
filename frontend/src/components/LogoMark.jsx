import React from 'react';

export const LogoMark = ({ size = 'md', className = '' }) => {
  const isLarge = size === 'lg';
  const iconSize = isLarge ? 'w-11 h-11' : 'w-10 h-10';
  const textSize = isLarge ? 'text-3xl' : 'text-2xl';

  return (
    <div className={`inline-flex items-center gap-3 group cursor-pointer select-none ${className}`}>
      {/* Prominent Hero Letter 'N' Emblem Badge */}
      <div className={`relative ${iconSize} flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 p-[2px] shadow-xl shadow-blue-500/30 group-hover:shadow-cyan-400/60 group-hover:scale-105 transition-all duration-300`}>
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300" />

        {/* Inner Dark Glass Container */}
        <div className="relative w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center backdrop-blur-md overflow-hidden border border-white/20">
          {/* Bold 3D Hero Letter 'N' Vector Icon */}
          <svg 
            className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Stem */}
            <path 
              d="M7 30V6" 
              stroke="url(#n_grad_left)" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
            {/* Diagonal Ribbon Connector */}
            <path 
              d="M7 6L29 30" 
              stroke="url(#n_grad_diag)" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
            {/* Right Stem */}
            <path 
              d="M29 30V6" 
              stroke="url(#n_grad_right)" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
            
            <defs>
              <linearGradient id="n_grad_left" x1="7" y1="6" x2="7" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="n_grad_diag" x1="7" y1="6" x2="29" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#60A5FA" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="n_grad_right" x1="29" y1="30" x2="29" y2="6" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Wordmark Enforced LTR for NexusPay */}
      <div dir="ltr" className={`font-black ${textSize} tracking-tight text-slate-900 dark:text-white flex items-center`}>
        <span>Nexus</span>
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-xs">
          Pay
        </span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-1 self-end mb-1.5" />
      </div>
    </div>
  );
};
