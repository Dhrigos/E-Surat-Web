import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    avatar: string;
    shortReview: string;
    fullReview: string;
}

const TestimonialsGrid: React.FC = () => {
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'A.R.',
            role: 'Yogyakarta',
            avatar: '/avatar_testimonial_1_1769031094268.png',
            shortReview: 'Awalnya ikut karena penasaran. Tapi dari Komcad saya belajar disiplin...',
            fullReview: 'Awalnya ikut karena penasaran. Tapi dari Komcad saya belajar disiplin dan kerja tim, hal-hal yang kepakai juga di hidup sehari-hari.'
        },
        {
            id: 2,
            name: 'D.S.',
            role: 'Bekasi',
            avatar: '/avatar_testimonial_2_1769031110087.png',
            shortReview: 'Saya kerja full time. Komcad ngajarin saya soal manajemen waktu...',
            fullReview: 'Saya kerja full time. Komcad ngajarin saya soal manajemen waktu dan tanggung jawab, bukan cuma soal latihan.'
        },
        {
            id: 3,
            name: 'M.W.',
            role: 'Surabaya',
            avatar: '/avatar_testimonial_3_1769031127602.png',
            shortReview: 'Buat saya, Komcad itu soal memberi contoh ke anak. Bahwa berkontribusi...',
            fullReview: 'Buat saya, Komcad itu soal memberi contoh ke anak. Bahwa berkontribusi ke negara bisa dimulai dari kesiapan diri.'
        },
        {
            id: 4,
            name: 'R.F.',
            role: 'Kupang',
            avatar: '/avatar_testimonial_4_1769031141171.png',
            shortReview: 'Saya dari daerah. Lewat Komcad, saya ketemu banyak orang dengan latar...',
            fullReview: 'Saya dari daerah. Lewat Komcad, saya ketemu banyak orang dengan latar belakang beda-beda, tapi tujuannya sama.'
        },
        {
            id: 5,
            name: 'L.N.',
            role: 'Bogor',
            avatar: '/avatar_testimonial_1_1769031094268.png',
            shortReview: 'Saya terbiasa ikut kegiatan sosial. Komcad memperluas cara saya melihat...',
            fullReview: 'Saya terbiasa ikut kegiatan sosial. Komcad memperluas cara saya melihat peran warga sipil dalam kondisi darurat.'
        },
        {
            id: 6,
            name: 'T.A.',
            role: 'Semarang',
            avatar: '/avatar_testimonial_2_1769031110087.png',
            shortReview: 'Komcad bikin saya lebih rapi, lebih siap, dan lebih percaya diri. Efeknya...',
            fullReview: 'Komcad bikin saya lebih rapi, lebih siap, dan lebih percaya diri. Efeknya kerasa sampai ke kerjaan.'
        },
        {
            id: 7,
            name: 'H.P.',
            role: 'Jakarta',
            avatar: '/avatar_testimonial_3_1769031127602.png',
            shortReview: 'Menurut saya, Komcad adalah wadah yang jelas bagi warga sipil yang ingin...',
            fullReview: 'Menurut saya, Komcad adalah wadah yang jelas bagi warga sipil yang ingin berkontribusi tanpa harus meninggalkan profesinya.'
        },
        {
            id: 8,
            name: 'S.K.',
            role: 'Malang',
            avatar: '/avatar_testimonial_4_1769031141171.png',
            shortReview: 'Saya nggak merasa jadi siapa-siapa. Tapi ikut Komcad bikin saya ngerasa...',
            fullReview: 'Saya nggak merasa jadi siapa-siapa. Tapi ikut Komcad bikin saya ngerasa punya peran.'
        }
    ];

    return (
        <>
            {/* Grid 4 columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                {testimonials.map((testimonial) => (
                    <motion.div
                        layoutId={`card-container-${testimonial.id}`}
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => setSelectedTestimonial(testimonial)}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        {/* Avatar */}
                        <motion.div
                            layoutId={`avatar-${testimonial.id}`}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                marginBottom: '1rem',
                                // border: '3px solid var(--primary-color)', // Removed custom border to let Avatar handle style
                            }}>
                            <Avatar className="w-full h-full">
                                <AvatarFallback className="text-xl bg-neutral-200 text-neutral-700 font-bold">
                                    {testimonial.name.replace(/\./g, '')}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>

                        {/* Name & Role */}
                        <motion.h3
                            layoutId={`name-${testimonial.id}`}
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#111',
                                marginBottom: '0.25rem'
                            }}>
                            {testimonial.name}
                        </motion.h3>
                        <motion.p
                            layoutId={`role-${testimonial.id}`}
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--primary-color)',
                                marginBottom: '1rem',
                                fontWeight: '600'
                            }}>
                            {testimonial.role}
                        </motion.p>

                        {/* Review Preview */}
                        <motion.p
                            layoutId={`review-${testimonial.id}`}
                            style={{
                                fontSize: '0.95rem',
                                color: '#555',
                                lineHeight: '1.6',
                                marginBottom: '1rem'
                            }}>
                            {testimonial.shortReview}
                        </motion.p>

                        {/* Read More Link */}
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--primary-color)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'gap 0.3s ease'
                            }}>
                            Baca Selengkapnya <i className="fa-solid fa-arrow-right"></i>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Modal for Full Review - Animated Expansion */}
            <AnimatePresence>
                {selectedTestimonial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTestimonial(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            layoutId={`card-container-${selectedTestimonial.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '3rem',
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                position: 'relative',
                                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
                                zIndex: 1001
                            }}
                        >
                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => setSelectedTestimonial(null)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: '#f3f4f6',
                                    color: '#111',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 20
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </motion.button>

                            {/* Avatar Large */}
                            <motion.div
                                layoutId={`avatar-${selectedTestimonial.id}`}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    // border: '4px solid var(--primary-color)',
                                    overflow: 'hidden',
                                    margin: '0 auto 1.5rem'
                                }}>
                                <Avatar className="w-full h-full">
                                    <AvatarFallback className="text-3xl bg-neutral-200 text-neutral-700 font-bold">
                                        {selectedTestimonial.name.replace(/\./g, '')}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>

                            {/* Name & Role */}
                            <motion.h2
                                layoutId={`name-${selectedTestimonial.id}`}
                                style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: '#111',
                                    marginBottom: '0.5rem',
                                    textAlign: 'center'
                                }}>
                                {selectedTestimonial.name}
                            </motion.h2>
                            <motion.p
                                layoutId={`role-${selectedTestimonial.id}`}
                                style={{
                                    fontSize: '1rem',
                                    color: 'var(--primary-color)',
                                    marginBottom: '2rem',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                {selectedTestimonial.role}
                            </motion.p>

                            {/* Decorative Line */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    width: '60px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, var(--primary-color), var(--accent-gold))',
                                    margin: '0 auto 2rem',
                                    borderRadius: '2px'
                                }} />

                            {/* Full Review */}
                            <motion.div
                                layoutId={`review-${selectedTestimonial.id}`}
                                style={{
                                    marginBottom: '2rem'
                                }}
                            >
                                <p style={{
                                    fontSize: '1.1rem',
                                    color: '#555',
                                    lineHeight: '1.8',
                                    textAlign: 'justify'
                                }}>
                                    "{selectedTestimonial.fullReview}"
                                </p>
                            </motion.div>

                            {/* Footer Stars */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.5rem',
                                    color: 'var(--accent-gold)'
                                }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={star} className="fa-solid fa-star"></i>
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TestimonialsGrid;
