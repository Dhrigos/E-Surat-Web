import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => url === path ? 'active' : '';

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-container">
                {/* 1. Logo */}
                <Link href="/" className="logo">
                    <img src="/KEMENTERIAN-PERTAHANAN.png" alt="Kementerian Pertahanan" style={{ height: '60px', width: 'auto' }} />
                    <span>KOMCAD</span>
                </Link>

                {/* 2. Nav Links (Pushed Left) */}
                <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <ul className="nav-list">
                        <li><Link href="/" className={`nav-link ${isActive('/')}`}>Beranda</Link></li>
                        <li><Link href="/about" className={`nav-link ${isActive('/about')}`}>Tentang</Link></li>
                        <li><Link href="/news" className={`nav-link ${isActive('/news')}`}>Berita</Link></li>
                        <li><Link href="/contact" className={`nav-link ${isActive('/contact')}`}>Kontak</Link></li>
                        <li className="mobile-cta">
                            <a href="/login" className="btn-cta">
                                Daftar / Login
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <a
                        href="/login" // Use standard href for full page reload to Login if it's a separate app part, or Link if SPA
                        className="btn-cta"
                    >
                        Daftar / Login
                    </a>
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>
            </div>
        </header>
    );
};

export default Header;
