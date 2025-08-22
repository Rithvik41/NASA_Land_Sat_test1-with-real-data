"use client";

import React from 'react';

interface MapPinProps {
    lat: number;
    lon: number;
}

export function MapPin({ lat, lon }: MapPinProps) {
    // This is a simplified visual representation and not a real map.
    // The pin's position is a rough approximation.
    const x = (lon + 180) / 360 * 100;
    const y = (90 - lat) / 180 * 100;

    return (
        <div className="w-full h-full bg-muted relative overflow-hidden">
            {/* A simplistic world map background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://placehold.co/600x400.png?text=World+Map')" }} data-ai-hint="world map"></div>
            
            <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                 <svg viewBox="0 0 24 24" fill="hsl(var(--primary))" className="w-full h-full drop-shadow-lg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>
        </div>
    );
}
