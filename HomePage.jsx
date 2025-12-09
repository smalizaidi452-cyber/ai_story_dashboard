// src/pages/HomePage.jsx (Final Corrected: Z-Index Fix for Buttons & Scroll Check)

import React from 'react';
import { Film, Clapperboard, Lightbulb, ScrollText, Aperture } from 'lucide-react'; 

// IMPORTANT: Ensure this path is correct
const CENTERPIECE_IMAGE_URL = '/images/ai-home.webp'; 

const HomePage = () => {
    return (
        // Main Container: min-h-screen/w-screen aur overflow-hidden (Scroll Control)
        // p-0 padding ko bilkul khatam karta hai
        <div className="relative flex flex-col items-center justify-center w-screen min-h-screen bg-rm-dark-bg p-0 overflow-hidden">
            
            {/* 1. Animated Volumetric Lights (Lowest Z-Index: z-0) */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-rm-accent/20 rounded-full blur-3xl z-0" // z-0
                style={{ animation: 'spotlightPulse 5s ease-in-out infinite alternate' }}
            ></div>

            {/* Main Content Area - Contains Centerpiece and Text (z-10) */}
            <div className="relative z-10 p-2 sm:p-4 bg-transparent flex flex-col items-center justify-center max-h-screen w-full"> 
                
                {/* Centerpiece Image Container (Circular and VH-sized) */}
                <div 
                    className="relative w-[70vh] h-[70vh] sm:w-[80vh] sm:h-[80vh] mx-auto bg-cover bg-center rounded-full border border-rm-accent/60 shadow-neon-blue-lg mb-4" 
                    style={{ 
                        backgroundImage: `url(${CENTERPIECE_IMAGE_URL})`,
                        backgroundSize: '150%', 
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Inner Rotating Film Reel (Icon over the image) */}
                    <Film 
                        className="absolute inset-0 m-auto w-1/3 h-1/3 text-rm-cyan/50 animate-spin-slow opacity-50"
                        style={{ animationDuration: '40s' }}
                    />
                    
                    {/* Glowing Aperture/Light in the center */}
                    <Aperture className="absolute inset-0 m-auto w-10 h-10 text-rm-cyan/80 shadow-neon-cyan-md animate-blink-quick" />
                
                    {/* 2. Animated Elements Spreading from Edges */}
                    
                    {/* Clapboard Element (Top Right Edge) */}
                    <Clapperboard 
                        className="absolute top-[-30px] right-[-30px] w-12 h-12 sm:w-14 sm:h-14 text-rm-accent/90 shadow-neon-blue-lg animate-blink-quick" 
                        style={{ animationDuration: '2s', animationDelay: '0.5s' }}
                    />

                    {/* Film Reel Monogram (Top Left Edge) */}
                    <Film
                        className="absolute top-[-30px] left-[-30px] w-10 h-10 sm:w-12 sm:h-12 text-rm-cyan/80 animate-spin-slow" 
                        style={{ animationDuration: '30s', animationDelay: '1s' }}
                    />

                    {/* Spotlight/Light Monogram (Bottom Right Edge) */}
                    <div 
                        className="absolute bottom-[-30px] right-[-30px] w-12 h-12 sm:w-14 sm:h-14 bg-rm-cyan/10 border border-rm-cyan/50 rounded-full p-2 text-rm-cyan shadow-neon-cyan-md animate-blink-quick" 
                        style={{ animationDuration: '3s', animationDelay: '1.5s' }}
                    >
                        <Lightbulb className='w-full h-full' />
                    </div>

                    {/* Script/Monogram (Bottom Left Edge) */}
                    <ScrollText
                        className="absolute bottom-[-30px] left-[-30px] w-12 h-12 sm:w-14 sm:h-14 text-rm-text-light/60 shadow-neon-cyan-md"
                        style={{ animation: 'spotlightPulse 3s ease-in-out infinite alternate reverse' }}
                    />
                </div>
                
                {/* Text and CTAs (Buttons) - Highest Z-Index: z-20 for clickability */}
                <div className="text-center mt-0 z-20"> 
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-rm-cyan mb-1 tracking-wider shadow-neon-cyan-md">
                        REELMIND AI
                    </h1>
                    <p className="text-base sm:text-lg text-rm-text-light/70 font-light max-w-lg mx-auto">
                        The Future of Film Production Management.
                    </p>

                    {/* BUTTONS FIX: z-index ensures buttons are clickable */}
                    <div className="mt-4 flex items-center justify-center space-x-4 sm:space-x-6 z-20"> 
                        {/* Film Reel Icon */}
                        <button className="px-5 py-2 sm:px-6 sm:py-3 bg-rm-accent hover:bg-rm-accent/90 rounded-lg font-semibold text-sm sm:text-base text-rm-dark-bg transition shadow-lg shadow-rm-accent/50 flex items-center justify-center">
                            <Film className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Start Scheduling
                        </button>
                        <button className="px-5 py-2 sm:px-6 sm:py-3 border border-rm-cyan text-sm sm:text-base text-rm-cyan hover:bg-rm-cyan/10 rounded-lg font-semibold transition shadow-lg shadow-rm-cyan/50">
                            View Dashboard
                        </button>
                    </div>
                </div>

            </div>

            {/* 3. Script Scroll Animation (Bottom Banner) - Fixed at the very bottom (z-20 for visibility) */}
            <div className="absolute bottom-0 w-full overflow-hidden h-6 bg-rm-bg-surface/50 border-t border-rm-cyan/30 z-20"> 
                <div className="flex w-[200%] h-full items-center whitespace-nowrap" style={{ animation: 'scrollHorizontal 25s linear infinite' }}>
                    <ScrollText className="inline-block w-4 h-4 mr-2 text-rm-cyan/80" />
                    <span className="text-xs text-rm-text-light/50 font-mono mr-12">
                        ACTION: The camera pans across the futuristic cityscape... INT. OFFICE - NIGHT. The producer stares at the budget. CUT TO: AI-powered scheduling screen... ACTION: The camera pans across the futuristic cityscape... INT. OFFICE - NIGHT. The producer stares at the budget. CUT TO: AI-powered scheduling screen...
                    </span>
                    <ScrollText className="inline-block w-4 h-4 mr-2 text-rm-cyan/80" />
                    <span className="text-xs text-rm-text-light/50 font-mono">
                        ACTION: The camera pans across the futuristic cityscape... INT. OFFICE - NIGHT. The producer stares at the budget. CUT TO: AI-powered scheduling screen... 
                    </span>
                </div>
            </div>
            
        </div>
    );
}

export default HomePage;