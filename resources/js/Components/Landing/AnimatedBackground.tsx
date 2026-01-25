import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    twinkleSpeed: number;
    growing: boolean;
    color: { r: number; g: number; b: number };
    vx: number;
    vy: number;
}

const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles with varied properties
        const particles: Particle[] = [];
        const particleCount = 150;

        const colors = [
            { r: 212, g: 175, b: 55 },  // Gold
            { r: 172, g: 0, b: 33 },    // Red
            { r: 255, g: 255, b: 255 }, // White
            { r: 100, g: 200, b: 255 }  // Light Blue
        ];

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2.5 + 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                growing: Math.random() > 0.5,
                color: color,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        }

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                // Twinkling effect
                if (particle.growing) {
                    particle.opacity += particle.twinkleSpeed;
                    if (particle.opacity >= 1) {
                        particle.growing = false;
                    }
                } else {
                    particle.opacity -= particle.twinkleSpeed;
                    if (particle.opacity <= 0.2) {
                        particle.growing = true;
                    }
                }

                // Slow movement
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
                ctx.fill();

                // Add glow effect
                const glowSize = particle.radius * 5;
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, glowSize
                );
                gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity * 0.6})`);
                gradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity * 0.2})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    particle.x - glowSize,
                    particle.y - glowSize,
                    glowSize * 2,
                    glowSize * 2
                );
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: 0.8
            }}
        />
    );
};

export default AnimatedBackground;
