import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

const About = () => {
    const latarBelakangRef = useRef(null);
    const prinsipRef = useRef(null);

    return (
        <LandingLayout>
            <Head title="Tentang Komcad" />
            <div style={{ paddingTop: '120px', minHeight: '80vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(172, 0, 33, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '-5%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    filter: 'blur(80px)'
                }} />

                {/* Hero Section */}
                <div className="container" style={{ paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
                    >
                        <motion.span
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                display: 'inline-block',
                                padding: '0.6rem 1.8rem',
                                background: 'linear-gradient(135deg, rgba(172, 0, 33, 0.15) 0%, rgba(212, 175, 55, 0.15) 100%)',
                                border: '1px solid rgba(172, 0, 33, 0.4)',
                                borderRadius: '50px',
                                color: 'var(--primary-color)',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '2rem',
                                boxShadow: '0 4px 20px rgba(172, 0, 33, 0.2)'
                            }}>
                            <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.5rem' }}></i>
                            Tentang Kami
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                                fontWeight: '900',
                                color: 'white',
                                marginBottom: '2rem',
                                lineHeight: '1.1',
                                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                            }}>
                            Kesiapsiagaan adalah <span style={{
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #D4AF37 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>Pilihan</span>,<br />
                            Bukan Reaksi
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            style={{
                                fontSize: '1.25rem',
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.9',
                                maxWidth: '750px',
                                margin: '0 auto',
                                fontWeight: '400'
                            }}>
                            Dalam dunia yang makin sulit ditebak, kesiapan tidak bisa dibangun mendadak.
                            Ia perlu disiapkan, dilatih, dan dijaga, bahkan ketika keadaan sedang baik-baik saja.
                            <span style={{ display: 'block', marginTop: '1rem', fontStyle: 'italic', color: 'var(--accent-gold)' }}>
                                Komcad hadir sebagai bagian dari upaya itu.
                            </span>
                        </motion.p>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div style={{ background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)', position: 'relative', zIndex: 1 }}>
                    <div className="container section-padding">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{ maxWidth: '900px', margin: '0 auto' }}
                        >
                            {/* Section 1 */}
                            <div style={{ marginBottom: '6rem' }} ref={latarBelakangRef}>
                                {/* Decorative Divider */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    marginBottom: '3rem'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(172, 0, 33, 0.5) 50%, transparent 100%)'
                                    }} />
                                    <span style={{
                                        color: 'var(--primary-color)',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px'
                                    }}>01</span>
                                    <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(172, 0, 33, 0.5) 50%, transparent 100%)'
                                    }} />
                                </div>

                                <h2 style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '2rem',
                                    position: 'relative',
                                    paddingLeft: '2rem'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '4px',
                                        height: '100%',
                                        background: 'linear-gradient(180deg, var(--primary-color) 0%, var(--accent-gold) 100%)',
                                        borderRadius: '2px'
                                    }} />
                                    Ketika Keadaan Datang Tanpa Peringatan
                                </h2>
                                <div style={{
                                    fontSize: '1.1rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: '1.9',
                                    textAlign: 'justify'
                                }}>
                                    <p style={{ marginBottom: '1.5rem' }}>
                                        Indonesia bukan negara yang asing dengan situasi darurat.
                                        Bencana alam, krisis kemanusiaan, dan berbagai kondisi tidak terduga kerap datang tanpa aba-aba.
                                    </p>
                                    <p style={{ marginBottom: '1.5rem' }}>
                                        Di momen seperti itu, yang sering bergerak pertama bukan wacana, tapi warga.
                                        Orang-orang biasa yang membantu evakuasi, menjaga ketertiban, mengatur logistik, dan saling menopang.
                                    </p>
                                    <p style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(172, 0, 33, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                                        borderLeft: '4px solid var(--primary-color)',
                                        borderRadius: '0 12px 12px 0',
                                        fontStyle: 'italic',
                                        color: 'rgba(255,255,255,0.9)'
                                    }}>
                                        Pengalaman-pengalaman inilah yang menunjukkan satu hal:
                                        kesiapsiagaan manusia sama pentingnya dengan sistem dan peralatan.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div style={{ marginBottom: '5rem' }}>
                                <h2 style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '2rem',
                                    position: 'relative',
                                    paddingLeft: '2rem'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '4px',
                                        height: '100%',
                                        background: 'linear-gradient(180deg, var(--primary-color) 0%, var(--accent-gold) 100%)',
                                        borderRadius: '2px'
                                    }} />
                                    Menyiapkan Warga Negara untuk Saat Dibutuhkan
                                </h2>
                                <div style={{
                                    fontSize: '1.1rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: '1.9',
                                    textAlign: 'justify'
                                }}>
                                    <p style={{ marginBottom: '1.5rem' }}>
                                        Komcad, atau Komponen Cadangan, adalah ruang bagi warga negara yang secara sukarela memilih untuk menyiapkan diri lebih awal. Bukan untuk mengubah identitas, dan bukan untuk menggantikan peran siapa pun, melainkan untuk membangun kesiapan ketika keadaan menuntut kontribusi lebih.
                                    </p>
                                    <p style={{ marginBottom: '1.5rem' }}>
                                        Peserta Komcad tetap menjalani kehidupan sipil seperti biasa. Setelah pelatihan, mereka kembali ke profesi dan aktivitas masing-masing. Tidak ada perubahan status. Yang bertambah adalah pengalaman, kedisiplinan, serta kesiapan fisik dan mental dalam menghadapi kondisi yang tidak ideal.
                                    </p>
                                    <p>
                                        Pelatihan Komcad dirancang secara proporsional. Fokusnya bukan pada pembentukan pasukan, tetapi pada kemampuan dasar yang sering kali baru terasa penting saat keadaan darurat terjadi: ketenangan, kerja sama, ketahanan fisik, dan keteraturan dalam bertindak.
                                    </p>
                                </div>
                            </div>

                            {/* Principles Section */}
                            <div style={{ marginBottom: '6rem' }} ref={prinsipRef}>
                                {/* Decorative Divider */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    marginBottom: '3rem'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(172, 0, 33, 0.5) 50%, transparent 100%)'
                                    }} />
                                    <span style={{
                                        color: 'var(--primary-color)',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px'
                                    }}>02</span>
                                    <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(172, 0, 33, 0.5) 50%, transparent 100%)'
                                    }} />
                                </div>

                                <h2 style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '3rem',
                                    textAlign: 'center'
                                }}>
                                    Prinsip yang Menjadi Pegangan
                                </h2>

                                <div className="principles-grid">
                                    {[
                                        {
                                            icon: 'fa-hand-holding-heart',
                                            title: 'Sukarela',
                                            desc: 'Partisipasi lahir dari kesadaran, bukan kewajiban.'
                                        },
                                        {
                                            icon: 'fa-users',
                                            title: 'Sipil sebagai Identitas Utama',
                                            desc: 'Peserta tetap warga sipil, sebelum dan sesudah pelatihan.'
                                        },
                                        {
                                            icon: 'fa-shield-halved',
                                            title: 'Kesiapsiagaan, Bukan Agresi',
                                            desc: 'Fokus pada kesiapan menghadapi situasi darurat, bukan konflik.'
                                        },
                                        {
                                            icon: 'fa-medal',
                                            title: 'Disiplin dan Tanggung Jawab',
                                            desc: 'Kesiapan berarti mampu bertindak tertib dalam kondisi sulit.'
                                        },
                                        {
                                            icon: 'fa-people-group',
                                            title: 'Kebersamaan',
                                            desc: 'Situasi darurat selalu membutuhkan kerja tim, bukan individu.'
                                        }
                                    ].map((principle, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            whileHover={{ y: -5 }}
                                            style={{
                                                padding: '2rem',
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                margin: '0 auto 1.5rem',
                                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #8B0018 100%)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 8px 24px rgba(172, 0, 33, 0.3)'
                                            }}>
                                                <i className={`fa-solid ${principle.icon}`} style={{
                                                    fontSize: '1.8rem',
                                                    color: 'white'
                                                }}></i>
                                            </div>
                                            <h3 style={{
                                                fontSize: '1.2rem',
                                                fontWeight: '700',
                                                color: 'white',
                                                marginBottom: '1rem'
                                            }}>
                                                {principle.title}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: 'rgba(255,255,255,0.7)',
                                                lineHeight: '1.6'
                                            }}>
                                                {principle.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Closing Statement */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    padding: '3rem',
                                    background: 'linear-gradient(135deg, rgba(172, 0, 33, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%)',
                                    borderRadius: '20px',
                                    border: '2px solid rgba(172, 0, 33, 0.3)',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    right: '-10%',
                                    width: '300px',
                                    height: '300px',
                                    background: 'radial-gradient(circle, rgba(172, 0, 33, 0.1) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }} />
                                <p style={{
                                    fontSize: '1.3rem',
                                    color: 'white',
                                    lineHeight: '1.9',
                                    fontWeight: '500',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    Tidak semua orang harus ikut Komcad, dan itu tidak menjadi masalah.<br />
                                    Namun negara perlu memastikan selalu ada warga yang bersedia menyiapkan diri.<br />
                                    Karena pada akhirnya, kesiapsiagaan bukan tentang siapa yang paling menonjol,<br />
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
                                        melainkan siapa yang sudah siap saat keadaan memerlukan.
                                    </span>
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default About;
