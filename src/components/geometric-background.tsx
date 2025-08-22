
import React from 'react';

export function GeometricBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full object-cover z-0"
    >
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#0A0A0A', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(119, 221, 119, 0.3)', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(119, 221, 119, 0)', stopOpacity: 0 }} />
        </linearGradient>
        <style>
          {`
            .grid-line {
                stroke: rgba(119, 221, 119, 0.05);
                stroke-width: 1;
            }
            .glow-line {
                stroke: #77DD77;
                stroke-width: 1.5;
                filter: url(#glow);
                opacity: 0;
                animation: draw 8s ease-in-out infinite;
            }
            @keyframes draw {
                0% { stroke-dasharray: 0 1000; opacity: 0; }
                25% { stroke-dasharray: 1000 0; opacity: 0.7; }
                75% { stroke-dasharray: 1000 0; opacity: 0.7; }
                100% { stroke-dasharray: 1000 0; opacity: 0; }
            }
            .glow-line-2 { animation-delay: -2s; }
            .glow-line-3 { animation-delay: -4s; }
            .glow-line-4 { animation-delay: -6s; }
          `}
        </style>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>
      
      <rect width="1920" height="1080" fill="url(#grad1)" />

      {/* Grid */}
      {Array.from({ length: 30 }).map((_, i) => (
        <g key={i}>
            <line className="grid-line" x1={i * 64} y1="0" x2={i * 64} y2="1080" />
            <line className="grid-line" x1="0" y1={i * 64} x2="1920" y2={i * 64} />
        </g>
      ))}

      {/* Centerpiece fade */}
      <rect width="1920" height="1080" fill="url(#grad2)" />

      {/* Glowing lines */}
      <path className="glow-line" d="M 0,540 L 400,200 L 800,700 L 1200,300 L 1600,800 L 1920,540" fill="none" />
      <path className="glow-line glow-line-2" d="M 0,800 L 500,400 L 900,900 L 1300,200 L 1700,600 L 1920,800" fill="none" />
      <path className="glow-line glow-line-3" d="M 1920,200 L 1500,600 L 1100,100 L 700,700 L 300,300 L 0,600" fill="none" />
      <path className="glow-line glow-line-4" d="M 1920,900 L 1400,500 L 1000,1000 L 600,400 L 200,800 L 0,400" fill="none" />
    </svg>
  );
}
