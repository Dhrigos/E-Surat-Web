import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import LandingLayout from '@/Layouts/LandingLayout';

const newsData = [
    {
        id: 1,
        category: 'Berita',
        date: '25 Jan 2026',
        title: 'Beasiswa Patriot Dibuka, Komcad Dapat Porsi Khusus hingga 60 Persen',
        excerpt: 'Pemerintah menyiapkan peluang baru bagi generasi muda yang ingin berkontribusi lebih luas untuk negara. Melalui program Beasiswa Patriot Transmigrasi, Kementerian Transmigrasi RI akan membuka sekitar 1.000 kuota beasiswa mulai tahun 2026.',
        image: '/official-hero.png',
        // Wait, I can't easily rename in one step. I'll just use the text update first. The user uploaded an image... I should probably move it to public.
        readTime: '3 menit'
    },
    {
        id: 2,
        category: 'Berita',
        date: '25 Jan 2026',
        title: 'Komcad Matra Udara TA 2025 Resmi Ditetapkan, Fokus pada Kesiapan dan Profesionalisme',
        excerpt: 'Komponen Cadangan (Komcad) Matra Udara Tahun Anggaran 2025 resmi ditetapkan dalam sebuah upacara yang dipimpin oleh Komandan Komando Pembinaan Doktrin, Pendidikan, dan Latihan TNI Angkatan Udara (Dankodiklatau).',
        image: '/official-hero.png',
        readTime: '4 menit'
    },
    {
        id: 3,
        category: 'Kegiatan',
        date: '2 Jan 2026',
        title: 'Pelatihan Cyber Defense Angkatan 3',
        excerpt: 'Ekspansi program ke seluruh wilayah Indonesia dengan membuka kelas regional di berbagai provinsi.',
        image: '/official-hero.png',
        readTime: '6 menit'
    }
];

const NewsIndex = () => {
    return (
        <LandingLayout>
            <Head title="Berita & Informasi" />
            <div className="container section-padding" style={{ paddingTop: '120px', minHeight: '80vh' }}>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(172, 0, 33, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
                        border: '1px solid rgba(172, 0, 33, 0.3)',
                        borderRadius: '50px',
                        color: 'var(--primary-color)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '1.5rem'
                    }}>
                        <i className="fa-solid fa-newspaper" style={{ marginRight: '0.5rem' }}></i>
                        Informasi Terkini
                    </span>
                    <h1 className="section-title" style={{ marginBottom: '1rem' }}>
                        Berita <span className="highlight">Terkini</span>
                    </h1>
                    <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.7' }}>
                        Update terbaru seputar kegiatan dan perkembangan Komponen Cadangan
                    </p>
                </motion.div>

                {/* News Grid */}
                <div style={{
                    display: 'grid',
                    gap: '2.5rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
                }}>
                    {newsData.map((news, index) => (
                        <motion.div
                            key={news.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={`/news/${news.id}`} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="news-card"
                                >
                                    {/* Image Container */}
                                    <div style={{
                                        position: 'relative',
                                        height: '240px',
                                        overflow: 'hidden',
                                        background: '#1a1a1a'
                                    }}>
                                        <motion.img
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            src={news.image}
                                            alt={news.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        {/* Gradient Overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)'
                                        }} />

                                        {/* Category Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            left: '1rem',
                                            padding: '0.4rem 1rem',
                                            background: 'rgba(172, 0, 33, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: 'white'
                                        }}>
                                            {news.category}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* Date & Read Time */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '1rem',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <i className="fa-regular fa-calendar"></i>
                                                {news.date}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <i className="fa-regular fa-clock"></i>
                                                {news.readTime}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 style={{
                                            margin: '0 0 1rem',
                                            fontSize: '1.4rem',
                                            color: 'white',
                                            fontWeight: '700',
                                            lineHeight: '1.4',
                                            transition: 'color 0.3s ease'
                                        }}>
                                            {news.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            marginBottom: '1.5rem',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.7',
                                            flex: 1
                                        }}>
                                            {news.excerpt}
                                        </p>

                                        {/* Read More Link */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--primary-color)',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                            transition: 'gap 0.3s ease'
                                        }}
                                            className="read-more-link">
                                            Baca Selengkapnya
                                            <motion.i
                                                className="fa-solid fa-arrow-right"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                style={{ fontSize: '0.85rem' }}
                                            ></motion.i>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </LandingLayout>
    );
};

export default NewsIndex;
