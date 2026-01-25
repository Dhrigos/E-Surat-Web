import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <LandingLayout>
            <Head title="Hubungi Kami" />
            <div className="container section-padding" style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="tag" style={{
                            marginBottom: '1rem',
                            display: 'inline-flex',
                            background: 'linear-gradient(135deg, #E6F4F1 0%, #E0F2FE 100%)',
                            color: '#0891B2',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            <i className="fa-solid fa-headset" style={{ color: '#0891B2', marginRight: '0.5rem' }}></i> Kami Siap Membantu
                        </span>
                        <h1 className="section-title" style={{ marginTop: '1rem' }}>Hubungi <span className="highlight">Kami</span></h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
                            Punya pertanyaan seputar pendaftaran atau kegiatan? Tim kami siap membantu kamu dengan ramah dan profesional.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <motion.div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    position: 'relative',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    overflow: 'hidden'
                                }}
                                whileHover={{
                                    x: 5,
                                    boxShadow: '0 8px 32px rgba(172, 0, 33, 0.2)',
                                    borderColor: 'rgba(172, 0, 33, 0.3)'
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {/* Animated light effect */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(172, 0, 33, 0.1), transparent)',
                                        pointerEvents: 'none'
                                    }}
                                    animate={{
                                        left: ['100%', '-100%']
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear'
                                    }}
                                />
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-color)',
                                    boxShadow: '0 4px 15px rgba(172, 0, 33, 0.2), 0 0 20px rgba(172, 0, 33, 0.1)',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <i className="fa-solid fa-envelope" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Email Kami</span>
                                    <strong style={{ color: 'white', fontSize: '1.05rem' }}>info@komcad.bacadnas.com</strong>
                                </div>
                            </motion.div>

                            <motion.div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    position: 'relative',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    overflow: 'hidden'
                                }}
                                whileHover={{
                                    x: 5,
                                    boxShadow: '0 8px 32px rgba(8, 145, 178, 0.2)',
                                    borderColor: 'rgba(8, 145, 178, 0.3)'
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {/* Animated light effect */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(8, 145, 178, 0.1), transparent)',
                                        pointerEvents: 'none'
                                    }}
                                    animate={{
                                        left: ['100%', '-100%']
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                        delay: 1
                                    }}
                                />
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0891B2',
                                    boxShadow: '0 4px 15px rgba(8, 145, 178, 0.2), 0 0 20px rgba(8, 145, 178, 0.1)',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <i className="fa-solid fa-location-dot" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Kantor Pusat</span>
                                    <strong style={{ color: 'white', fontSize: '1.05rem' }}>Kementerian Pertahanan RI, Jakarta</strong>
                                </div>
                            </motion.div>

                            <motion.div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    position: 'relative',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    overflow: 'hidden'
                                }}
                                whileHover={{
                                    x: 5,
                                    boxShadow: '0 8px 32px rgba(5, 150, 105, 0.2)',
                                    borderColor: 'rgba(5, 150, 105, 0.3)'
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {/* Animated light effect */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.1), transparent)',
                                        pointerEvents: 'none'
                                    }}
                                    animate={{
                                        left: ['100%', '-100%']
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                        delay: 2
                                    }}
                                />
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#059669',
                                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2), 0 0 20px rgba(5, 150, 105, 0.1)',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <i className="fa-solid fa-clock" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Jam Operasional</span>
                                    <strong style={{ color: 'white', fontSize: '1.05rem' }}>Senin - Jumat, 08:00 - 16:00 WIB</strong>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>Kirim Pesan</h3>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Nama Lengkap</label>
                        <motion.input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama kamu"
                            whileFocus={{ scale: 1.02 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.1)',
                                marginBottom: '1.5rem',
                                outline: 'none',
                                transition: 'all 0.3s',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Email</label>
                        <motion.input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            whileFocus={{ scale: 1.02 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.1)',
                                marginBottom: '1.5rem',
                                outline: 'none',
                                transition: 'all 0.3s',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Pesan</label>
                        <motion.textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Apa yang ingin ditanyakan?"
                            whileFocus={{ scale: 1.02 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.1)',
                                marginBottom: '2rem',
                                outline: 'none',
                                minHeight: '120px',
                                fontFamily: 'inherit',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        ></motion.textarea>

                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(172, 0, 33, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem',
                                padding: '1.1rem'
                            }}
                        >
                            Kirim Pesan <i className="fa-solid fa-paper-plane"></i>
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default Contact;
