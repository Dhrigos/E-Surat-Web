import React from 'react';

const DashboardBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-gray-50 dark:bg-black transition-colors duration-500">
            {/* 1. Base Gradient - Adaptive: Light (Clean Tactical) / Dark (Deep Red) */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-white to-gray-100 dark:from-red-950 dark:via-[#0a0a0a] dark:to-black opacity-100 transition-opacity duration-500" />

            {/* 2. Noise Texture - Adds grit/tactical feel */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* 3. Scar/Scratch Effect - Subtle diagonal lines */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)`
                }}
            />

            {/* 4. Vignette - Focus center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

            {/* 5. Animated Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-black/10 dark:bg-white/10"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animation: `float-particle ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: `-${Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <style>
                {`
                @keyframes float-particle {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    20% { opacity: 0.3; }
                    80% { opacity: 0.3; }
                    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
                }
                `}
            </style>
        </div>
    );
};

export default DashboardBackground;
