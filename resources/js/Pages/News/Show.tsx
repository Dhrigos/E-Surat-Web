import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import LandingLayout from '@/Layouts/LandingLayout';

// Sample news data (ideally this comes from backend but keeping static fallback for now)
const newsData: Record<string, any> = {
    1: {
        id: 1,
        category: 'Berita',
        date: '25 Jan 2026',
        title: 'Beasiswa Patriot Dibuka, Komcad Dapat Porsi Khusus hingga 60 Persen',
        excerpt: 'Pemerintah menyiapkan peluang baru bagi generasi muda yang ingin berkontribusi lebih luas untuk negara. Melalui program Beasiswa Patriot Transmigrasi, Kementerian Transmigrasi RI akan membuka sekitar 1.000 kuota beasiswa mulai tahun 2026.',
        image: '/official-hero.png',
        readTime: '3 menit',
        author: 'Tim Redaksi KomCad',
        content: `
            <p><strong>Semarang</strong> — Pemerintah menyiapkan peluang baru bagi generasi muda yang ingin berkontribusi lebih luas untuk negara. Melalui program Beasiswa Patriot Transmigrasi, Kementerian Transmigrasi RI akan membuka sekitar 1.000 kuota beasiswa mulai tahun 2026, dengan 30–60 persen dialokasikan khusus untuk anggota Komponen Cadangan (Komcad).</p>
            
            <p>Menteri Transmigrasi RI, Muhammad Iftitah Sulaiman Suryanagara, menyampaikan bahwa program ini dirancang untuk menjawab tantangan pembangunan kawasan transmigrasi sekaligus menyiapkan SDM muda yang adaptif, terdidik, dan siap terjun langsung ke lapangan.</p>
            
            <p>“Transmigrasi hari ini bukan sekadar soal perpindahan penduduk, tapi soal menyiapkan generasi yang siap membangun dan menjaga keberlanjutan wilayah,” ujarnya saat memberikan kuliah umum di Universitas Diponegoro (Undip), Semarang.</p>
            
            <p>Program Beasiswa Patriot akan melibatkan sejumlah perguruan tinggi negeri terkemuka dan membuka peluang double degree dengan kampus luar negeri, salah satunya Technical University of Munich, Jerman. Peserta terpilih nantinya akan ditempatkan di beberapa kawasan transmigrasi prioritas seperti Barelang (Batam), Salor (Merauke), serta wilayah di Sulawesi Tengah atau Sulawesi Barat.</p>
            
            <p>Khusus bagi anggota Komcad, alokasi kuota beasiswa ini dipandang sebagai bentuk penguatan peran sipil dalam pembangunan nasional, tidak hanya dalam konteks pertahanan, tetapi juga pendidikan dan pengabdian masyarakat.</p>
            
            <p>“Komcad adalah contoh kesiapan warga negara. Lewat program ini, kesiapan itu kami hubungkan dengan peningkatan kapasitas dan kontribusi nyata,” tambah Iftitah.</p>
            
            <p>Rektor Undip, Suharnomo, menyatakan kesiapan kampus dalam mendukung program tersebut, termasuk melalui penyediaan program studi dan skema akademik yang memungkinkan kolaborasi internasional.</p>
            
            <p>Ke depan, proses seleksi Beasiswa Patriot akan mencakup uji akademik, tes terpusat, serta penilaian psikologis, guna memastikan peserta tidak hanya unggul secara akademis, tetapi juga siap secara mental dan sosial untuk menjalani penugasan di kawasan transmigrasi.</p>
            
            <p>Program ini diharapkan menjadi jalur baru bagi generasi muda, termasuk anggota Komcad, untuk mengembangkan diri sekaligus mengambil peran aktif dalam pembangunan Indonesia secara berkelanjutan.</p>
            
            <p style="font-style: italic; font-size: 0.9em; margin-top: 2rem;">Sumber: <a href="https://www.detik.com/jateng/berita/d-8188169/mentrans-siapkan-kuota-1-000-beasiswa-patriot-30-60-persen-untuk-komcad" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color);">Detik Jateng</a></p>
        `
    },
    2: {
        id: 2,
        category: 'Berita',
        date: '25 Jan 2026',
        title: 'Komcad Matra Udara TA 2025 Resmi Ditetapkan, Fokus pada Kesiapan dan Profesionalisme',
        excerpt: 'Komponen Cadangan (Komcad) Matra Udara Tahun Anggaran 2025 resmi ditetapkan dalam sebuah upacara yang dipimpin oleh Komandan Komando Pembinaan Doktrin, Pendidikan, dan Latihan TNI Angkatan Udara (Dankodiklatau).',
        image: '/official-hero.png',
        readTime: '4 menit',
        author: 'Tim Redaksi KomCad',
        content: `
            <p><strong>Jakarta</strong> — Komponen Cadangan (Komcad) Matra Udara Tahun Anggaran 2025 resmi ditetapkan dalam sebuah upacara yang dipimpin oleh Komandan Komando Pembinaan Doktrin, Pendidikan, dan Latihan TNI Angkatan Udara (Dankodiklatau). Penetapan ini menjadi bagian dari upaya berkelanjutan untuk memperkuat sistem pertahanan negara melalui keterlibatan warga negara yang terlatih dan siap.</p>
            
            <p>Dalam sambutannya, pimpinan upacara menegaskan bahwa Komcad Matra Udara bukan sekadar program pelatihan, tetapi bagian dari sistem pertahanan semesta yang mengedepankan kesiapan, disiplin, dan profesionalisme. Anggota Komcad diharapkan mampu memahami peran strategis pertahanan udara dalam konteks pertahanan nasional yang semakin kompleks.</p>
            
            <p>“Komponen Cadangan adalah wujud partisipasi warga negara dalam menjaga kedaulatan, dengan tetap berada dalam koridor sipil dan ketentuan perundang-undangan,” disampaikan dalam amanat tersebut.</p>
            
            <p>Penetapan Komcad Matra Udara TA 2025 ini sekaligus menandai berakhirnya rangkaian pendidikan dan pelatihan dasar militer yang telah dijalani para peserta. Selama proses tersebut, peserta dibekali pengetahuan dasar pertahanan udara, kedisiplinan, kerja sama tim, serta pemahaman nilai-nilai kebangsaan yang menjadi fondasi pengabdian.</p>
            
            <p>TNI Angkatan Udara menegaskan bahwa kehadiran Komcad Matra Udara bukan untuk menggantikan peran prajurit aktif, melainkan sebagai unsur pendukung yang dapat digerakkan sesuai kebutuhan negara, terutama dalam situasi darurat atau kondisi tertentu yang membutuhkan kesiapsiagaan nasional.</p>
            
            <p>Melalui penetapan ini, Komcad Matra Udara diharapkan dapat menjadi jembatan antara kesiapan sipil dan sistem pertahanan negara, sekaligus membuka ruang bagi warga negara untuk berkontribusi secara terstruktur, terlatih, dan bertanggung jawab.</p>
            
            <p style="font-style: italic; font-size: 0.9em; margin-top: 2rem;">Sumber: <a href="https://tni-au.mil.id/berita/detail/dankodiklatau-pimpin-penetapan-komcad-matra-udara-tahun-anggaran-2025" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color);">TNI AU</a></p>
        `
    },
    3: {
        id: 3,
        category: 'Kegiatan',
        date: '2 Jan 2026',
        title: 'Pelatihan Cyber Defense Angkatan 3',
        excerpt: 'Generasi muda diajak untuk memahami pentingnya keamanan data dan infrastruktur digital negara...',
        image: '/official-hero.png',
        readTime: '6 menit',
        author: 'Tim Redaksi KomCad',
        content: `
            <p>Pelatihan Cyber Defense Angkatan 3 menandai ekspansi program ke seluruh wilayah Indonesia dengan membuka kelas regional di berbagai provinsi.</p>
            
            <h3>Jangkauan Nasional</h3>
            <p>Dengan membuka kelas di 10 provinsi, program ini memastikan akses yang lebih merata bagi seluruh anggota Komponen Cadangan di Indonesia.</p>
            
            <h3>Kolaborasi Industri</h3>
            <p>Angkatan ketiga ini juga menjalin kerjasama dengan perusahaan teknologi terkemuka untuk memberikan pengalaman praktis langsung dari industri.</p>
            
            <p>Melalui program ini, Indonesia terus memperkuat pertahanan sibernya dengan melibatkan generasi muda yang kompeten dan terlatih.</p>
        `
    }
};

interface Props {
    id: string; // Passed from route parameter
}

const NewsShow: React.FC<Props> = ({ id }) => {
    const news = newsData[id];

    if (!news) {
        return (
            <LandingLayout>
                <Head title="Berita Tidak Ditemukan" />
                <div className="container section-padding" style={{ paddingTop: '120px', minHeight: '80vh', textAlign: 'center' }}>
                    <h1>Berita Tidak Ditemukan</h1>
                    <Link href="/news" className="btn btn-primary" style={{ marginTop: '2rem' }}>Kembali ke Berita</Link>
                </div>
            </LandingLayout>
        );
    }

    return (
        <LandingLayout>
            <Head title={news.title} />
            <div style={{ paddingTop: '120px', minHeight: '80vh' }}>
                {/* Featured Image with Back Button Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        width: '100%',
                        height: '500px',
                        position: 'relative',
                        marginBottom: '3rem',
                        overflow: 'hidden'
                    }}
                >
                    <img
                        src={news.image}
                        alt={news.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)'
                    }} />

                    {/* Back Button Overlay */}
                    <div
                        className="hidden md:block" // Hidden on mobile, visible on desktop
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            left: '2rem', // Adjust based on container main alignment if needed, but 2rem is safe
                            zIndex: 10
                        }}
                    >
                        <Link
                            href="/news"
                            className='inline-flex'
                        >
                            <motion.button
                                whileHover={{ x: -5 }}
                                style={{
                                    background: 'rgba(0,0,0,0.3)', // Darker background for visibility on image
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '50px',
                                    padding: '0.75rem 1.5rem',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-color)';
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                <i className="fa-solid fa-arrow-left"></i> Kembali ke Berita
                            </motion.button>
                        </Link>
                    </div>

                    {/* Category Badge on Image */}
                    <div style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '0.6rem 1.5rem',
                        background: 'rgba(172, 0, 33, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'white'
                    }}>
                        {news.category}
                    </div>
                </motion.div>

                {/* Article Content */}
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ maxWidth: '900px', margin: '0 auto' }}
                    >
                        {/* Meta Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-regular fa-calendar"></i>
                                {news.date}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-regular fa-clock"></i>
                                {news.readTime}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-regular fa-user"></i>
                                {news.author}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            marginBottom: '2rem',
                            lineHeight: '1.2',
                            color: 'white',
                            fontWeight: '800'
                        }}>
                            {news.title}
                        </h1>

                        {/* Excerpt */}
                        <p style={{
                            fontSize: '1.2rem',
                            lineHeight: '1.8',
                            color: 'rgba(255,255,255,0.8)',
                            marginBottom: '3rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, rgba(172, 0, 33, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
                            borderLeft: '4px solid var(--primary-color)',
                            borderRadius: '0 12px 12px 0'
                        }}>
                            {news.excerpt}
                        </p>

                        {/* Article Content */}
                        <div
                            style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.9',
                                color: 'var(--text-muted)'
                            }}
                            className="article-content"
                            dangerouslySetInnerHTML={{ __html: news.content }}
                        />

                        {/* Share Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{
                                marginTop: '4rem',
                                paddingTop: '2rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1.5rem'
                            }}
                        >
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginRight: '1rem' }}>Bagikan artikel ini:</span>
                                <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
                                    {['facebook-f', 'twitter', 'linkedin-in', 'whatsapp'].map((icon) => (
                                        <motion.a
                                            key={icon}
                                            href="#"
                                            whileHover={{ scale: 1.1, y: -3 }}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--primary-color)';
                                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            }}
                                        >
                                            <i className={`fa-brands fa-${icon}`}></i>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Back to News Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            style={{ marginTop: '5rem', textAlign: 'center', paddingBottom: '3rem' }}
                        >
                            <Link href="/news">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-primary"
                                    style={{ padding: '1rem 2.5rem' }}
                                >
                                    <i className="fa-solid fa-newspaper" style={{ marginRight: '0.5rem' }}></i>
                                    Lihat Berita Lainnya
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default NewsShow;
