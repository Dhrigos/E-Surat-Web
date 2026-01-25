import React from 'react';
import { motion } from 'framer-motion';
import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import AnimatedBackground from '@/Components/Landing/AnimatedBackground';
import CarouselGallery from '@/Components/Landing/CarouselGallery';
import TestimonialsGrid from '@/Components/Landing/TestimonialsGrid';

const Welcome = () => {
    return (
        <LandingLayout>
            <Head title="Beranda" />
            <main>
                {/* HERO SECTION */}
                {/* HERO SECTION */}
                <section className="relative min-h-screen flex items-center overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80 z-[2]"></div>
                        <AnimatedBackground />
                        <img src="/official-hero.png" alt="Pasukan Komponen Cadangan" className="w-full h-full object-cover" />
                    </div>

                    <div className="container relative z-10 pt-24 md:pt-0 mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5 mb-8 md:mb-6"
                        >
                            <div className="text-center md:text-left border-l-0 md:border-l-4 border-red-600 md:pl-6 py-1">
                                <div className="text-sm tracking-[0.25em] uppercase text-white/70 font-medium mb-1">Republik Indonesia</div>
                                <div className="text-xl md:text-2xl tracking-[0.15em] uppercase text-white font-bold font-display">Kementerian Pertahanan</div>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                                lineHeight: 0.95,
                                textTransform: 'uppercase',
                                color: 'white',
                                marginBottom: '1.5rem',
                                maxWidth: '1200px',
                                letterSpacing: '0.05em'
                            }}

                        >
                            Komponen <br />
                            <span style={{
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #D4AF37 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>Cadangan</span>
                            {/* <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--primary-color)] to-[#D4AF37]">
                                Cadangan
                            </span> */}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl text-lg md:text-xl text-white/75 mb-10 md:mb-12 leading-relaxed font-normal text-center md:text-left mx-auto md:mx-0"
                        >
                            Bergabunglah dengan Komponen Cadangan. Wujudkan bakti nyata untuk kedaulatan negara dan keselamatan bangsa.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4 justify-center md:justify-start"
                        >
                            <button
                                onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn btn-primary"
                            >
                                Pelajari Selengkapnya <i className="fa-solid fa-arrow-down ml-2"></i>
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* BENTO GRID (Mission & Roles) */}
                <section id="mission" className="section-padding section-curved">
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>Misi <span className="highlight">Utama</span></h2>
                            <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>/// Arahan Resmi</span>
                        </div>

                        <div className="bento-grid">
                            {/* Large Feature */}
                            <motion.div
                                className="bento-card span-8"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>Sishankamrata</h3>
                                    <p style={{ color: '#555', maxWidth: '85%', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                        Sistem Pertahanan dan Keamanan Rakyat Semesta. KomCad memperkuat kekuatan komponen utama TNI dalam menjaga kedaulatan NKRI melalui pendekatan defensif aktif.
                                    </p>
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    right: '-10%',
                                    bottom: '-20%',
                                    opacity: 0.03,
                                    fontSize: '15rem',
                                    color: 'var(--primary-color)',
                                    pointerEvents: 'none'
                                }}>
                                    <i className="fa-solid fa-users-viewfinder"></i>
                                </div>
                                <div style={{ marginTop: '3rem', display: 'flex', gap: '4rem', position: 'relative', zIndex: 1 }}>
                                    <div>
                                        <div style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>3</div>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#888', letterSpacing: '1px', marginTop: '0.5rem' }}>Matra Utama</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>35k+</div>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#888', letterSpacing: '1px', marginTop: '0.5rem' }}>Personil Aktif</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Side Feature - White Theme */}
                            <motion.div
                                className="bento-card span-4"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                <i className="fa-solid fa-shield-halved" style={{ fontSize: '3rem', background: 'linear-gradient(135deg, var(--primary-color) 0%, #d62828 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'auto', display: 'inline-block' }}></i>
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem', color: '#111' }}>Bela Negara</h3>
                                    <p style={{ color: '#666', lineHeight: '1.6' }}>Hak dan kewajiban setiap warga negara untuk ikut serta dalam upaya pembelaan negara yang diwujudkan dalam penyelenggaraan pertahanan negara.</p>
                                </div>
                            </motion.div>

                            {/* Feature 3 - Matra Darat */}
                            <motion.div
                                className="bento-card span-4"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '24px',
                                    borderLeft: '4px solid var(--accent-gold)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: '700' }}>Matra Darat</div>
                                    <i className="fa-solid fa-person-rifle" style={{ color: 'rgba(0,0,0,0.2)' }}></i>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem', color: '#111' }}>Infanteri & Teritorial</h3>
                                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                                    Pasukan cadangan taktis yang siap dimobilisasi untuk memperkuat pertahanan darat dan menjaga stabilitas wilayah teritorial nasional.
                                </p>
                            </motion.div>

                            {/* Feature 4 - Matra Laut */}
                            <motion.div
                                className="bento-card span-4"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '24px',
                                    borderLeft: '4px solid var(--accent-blue)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: '700' }}>Matra Laut</div>
                                    <i className="fa-solid fa-ship" style={{ color: 'rgba(0,0,0,0.2)' }}></i>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem', color: '#111' }}>Operasi Maritim</h3>
                                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                                    Mendukung operasi keamanan laut, pengamanan pantai, dan pertahanan pangkalan dalam menjaga kedaulatan maritim Indonesia.
                                </p>
                            </motion.div>

                            {/* Feature 5 - Matra Udara */}
                            <motion.div
                                className="bento-card span-4"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '24px',
                                    borderLeft: '4px solid #00C2FF',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ color: '#00C2FF', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: '700' }}>Matra Udara</div>
                                    <i className="fa-solid fa-jet-fighter" style={{ color: 'rgba(0,0,0,0.2)' }}></i>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem', color: '#111' }}>Pertahanan Pangkalan</h3>
                                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                                    Memperkuat pertahanan pangkalan udara dan mendukung operasi penerbangan dalam sistem pertahanan udara nasional.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* MOTTO SECTION */}
                <section className="section-padding" style={{ background: '#F8F9FA', position: 'relative', overflow: 'hidden', paddingTop: '6rem', paddingBottom: '6rem' }}>
                    <div className="container">
                        {/* Quote Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                borderRadius: '24px',
                                padding: 'clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                maxWidth: '1100px',
                                margin: '0 auto'
                            }}
                        >
                            {/* Decorative Elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(172, 0, 33, 0.05) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '-50px',
                                left: '-50px',
                                width: '200px',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />

                            {/* Styled Title Component */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <h3 className="section-title" style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    color: '#111',
                                    display: 'inline-block'
                                }}>
                                    KOMPONEN <span className="highlight">CADANGAN</span>
                                </h3>
                            </motion.div>

                            {/* Main Title */}
                            <h2 style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                                fontWeight: '800',
                                color: '#000000',
                                marginBottom: '1.5rem',
                                lineHeight: '1.2',
                                letterSpacing: '-0.02em',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Ketika negara memanggil, <br></br>kesiapan adalah bentuk bakti yang paling nyata.
                            </h2>

                            {/* Description */}
                            <p style={{
                                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                                color: '#555',
                                lineHeight: '1.8',
                                maxWidth: '900px',
                                margin: '0 auto 1.5rem',
                                fontWeight: '400',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Komponen Cadangan menghubungkan peran warga dengan ketahanan bangsa.
                            </p>

                            {/* Italic tagline */}
                            {/* <p style={{
                                fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                                color: '#777',
                                fontStyle: 'italic',
                                fontWeight: '500',
                                margin: 0,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Komcad hadir sebagai bagian dari upaya itu.
                            </p> */}

                            {/* Decorative Line */}
                            <div style={{
                                width: '60px',
                                height: '4px',
                                background: 'linear-gradient(90deg, var(--primary-color), var(--accent-gold))',
                                margin: '2rem auto 0',
                                borderRadius: '2px',
                                position: 'relative',
                                zIndex: 1
                            }} />
                        </motion.div>
                    </div>
                </section>

                {/* CAROUSEL SECTION */}
                <section className="section-padding" style={{ background: '#F8F9FA', position: 'relative', overflow: 'hidden' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#111' }}>Galeri <span className="highlight">Komcad</span></h2>
                            <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>/// Dokumentasi</span>
                        </div>

                        <CarouselGallery />
                    </div>
                </section>

                {/* TESTIMONIALS SECTION - Ucap Mereka */}
                <section className="section-padding" style={{ background: '#ffffff', position: 'relative' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#111' }}>Ucap <span className="highlight">Mereka</span></h2>
                            <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>/// Testimoni</span>
                        </div>

                        <TestimonialsGrid />
                    </div>
                </section>
            </main>
        </LandingLayout>
    );
};

export default Welcome;
