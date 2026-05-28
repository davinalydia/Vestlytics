import React from 'react';

export const Logo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* The hollow V shape */}
    <path 
      d="M 20 20 L 50 80 L 80 20" 
      stroke="#00FFFF" 
      strokeWidth="14" 
      strokeLinejoin="round" 
      strokeLinecap="round" 
    />
    
    {/* The zigzag stock chart line overlapping the right side of the V */}
    {/* Drawn continuously to ensure a perfect smooth corner at the arrow tip */}
    <path 
      d="M 85 20 L 110 20 L 70 90 L 40 50 M 110 20 L 110 45" 
      stroke="#00FFFF" 
      strokeWidth="14" 
      strokeLinejoin="round" 
      strokeLinecap="round" 
    />
  </svg>
);
