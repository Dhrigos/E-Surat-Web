import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
    image: string;
    title: string;
    subtitle: string;
    description: string;
}

const CarouselGallery: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const slides: Slide[] = [
        {
            image: '/carousel_training_military_1769030245776.png',
            title: 'Pelatihan Taktis',
            subtitle: 'Latihan Dasar dan Lanjutan',
            description: 'Anggota Komcad menjalani pelatihan intensif untuk meningkatkan kemampuan taktis dan kesiapan operasional.'
        },
        {
            image: '/carousel_ceremony_komcad_1769030260844.png',
            title: 'Upacara Pelantikan',
            subtitle: 'Dedikasi untuk Negara',
            description: 'Pelantikan resmi anggota Komponen Cadangan sebagai bagian dari kekuatan pertahanan nasional Indonesia.'
        },
        {
            image: '/carousel_naval_operations_1769030278889.png',
            title: 'Operasi Maritim',
            subtitle: 'Matra Laut',
            description: 'Operasi patroli dan pengamanan wilayah perairan Indonesia oleh Komcad Matra Laut.'
        },
        {
            image: '/carousel_air_defense_1769030293388.png',
            title: 'Pertahanan Udara',
            subtitle: 'Matra Udara',
            description: 'Dukungan operasional dan pertahanan pangkalan udara oleh Komcad Matra Udara.'
        }
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, isAutoPlaying]);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1,
            zIndex: 1
        }),
        center: {
            x: 0,
            opacity: 1,
            zIndex: 1
        },
        exit: (direction: number) => ({
            x: 0, // Stay in place so the new slide covers it
            opacity: 1,
            zIndex: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + slides.length) % slides.length);
    };

    const nextSlide = () => paginate(1);
    const prevSlide = () => paginate(-1);

    return (
        <div
            className="relative w-full h-[600px] rounded-[24px] overflow-hidden bg-black group isolate"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "tween", ease: "easeInOut", duration: 0.5 },
                        opacity: { duration: 0.3 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            nextSlide();
                        } else if (swipe > swipeConfidenceThreshold) {
                            prevSlide();
                        }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].title}
                        className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white pointer-events-none">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 bg-[var(--primary-color)] rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                        >
                            {slides[currentIndex].subtitle}
                        </motion.span>
                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-display text-4xl md:text-5xl mb-4 leading-tight"
                        >
                            {slides[currentIndex].title}
                        </motion.h3>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="max-w-2xl text-lg text-white/80 leading-relaxed"
                        >
                            {slides[currentIndex].description}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons - Always Visible on Desktop */}
            {/* Navigation Buttons - Always Visible on Desktop */}
            {/* <button
                className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full items-center justify-center text-white hover:bg-[var(--primary-color)] transition-all duration-300 border border-white/10"
                onClick={prevSlide}
                aria-label="Previous Slide"
            >
                <i className="fa-solid fa-chevron-left text-lg"></i>
            </button>
            <button
                className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full items-center justify-center text-white hover:bg-[var(--primary-color)] transition-all duration-300 border border-white/10"
                onClick={nextSlide}
                aria-label="Next Slide"
            >
                <i className="fa-solid fa-chevron-right text-lg"></i>
            </button> */}

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                        }}
                        className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'w-8 bg-[var(--primary-color)]'
                            : 'w-2.5 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default CarouselGallery;
