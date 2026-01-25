import React from 'react';
import { Link } from '@inertiajs/react';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <img src="/KEMENTERIAN-PERTAHANAN.png" alt="Kementerian Pertahanan" style={{ height: '50px', width: 'auto' }} />
                            <span>KOM<span className="highlight">CAD</span></span>
                        </Link>
                        <p className="footer-tagline">Pertahanan Negara, Tanggung Jawab Bersama.</p>
                        <p className="footer-description">
                            Bergabunglah dengan Komponen Cadangan untuk memperkuat pertahanan nasional Indonesia.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="footer-links-group">
                        <div className="link-column">
                            <h4>Menu</h4>
                            <Link href="/about" className="footer-link">Tentang Kami</Link>
                            <Link href="/news" className="footer-link">Berita & Informasi</Link>
                            <Link href="/contact" className="footer-link">Hubungi Kami</Link>
                        </div>

                        <div className="link-column">
                            <h4>Akun</h4>
                            <a href="/login" className="footer-link">Masuk</a>
                            <a href="/register" className="footer-link">Daftar</a>
                            <a href="#" className="footer-link">Pusat Bantuan</a>
                        </div>

                        <div className="link-column">
                            <h4>Hubungi Kami</h4>
                            <a href="mailto:info@komcad.bacadnas.com" className="footer-link icon-link">
                                <i className="fa-regular fa-envelope"></i> info@komcad.bacadnas.com
                            </a>
                            <a href="tel:+62210000000" className="footer-link icon-link">
                                <i className="fa-solid fa-phone"></i> +62 21 0000 0000
                            </a>
                            <div className="footer-socials">
                                <a href="#" className="social-icon"><i className="fa-brands fa-instagram"></i></a>
                                <a href="#" className="social-icon"><i className="fa-brands fa-twitter"></i></a>
                                <a href="#" className="social-icon"><i className="fa-brands fa-youtube"></i></a>
                                <a href="#" className="social-icon"><i className="fa-brands fa-linkedin-in"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 KOMCAD. Hak Cipta Dilindungi.</p>
                    <div className="footer-legal">
                        <a href="#">Kebijakan Privasi</a>
                        <span className="separator">•</span>
                        <a href="#">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
