import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const newClick = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY
            };
            setClicks(prev => [...prev, newClick]);

            setTimeout(() => {
                setClicks(prev => prev.filter(click => click.id !== newClick.id));
            }, 1000);
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <>
            {/* Click Ripple Effects */}
            {clicks.map(click => (
                <motion.div
                    key={click.id}
                    initial={{
                        x: click.x - 25,
                        y: click.y - 25,
                        scale: 0,
                        opacity: 1
                    }}
                    animate={{
                        scale: 2,
                        opacity: 0
                    }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut'
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid var(--primary-color)',
                        pointerEvents: 'none',
                        zIndex: 9998
                    }}
                />
            ))}
        </>
    );
};

export default CustomCursor;
