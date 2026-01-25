import React, { ReactNode } from 'react';
import '../../css/landing.css';
import Header from '@/Components/Landing/Layout/Header';
import Footer from '@/Components/Landing/Layout/Footer';
import CustomCursor from '@/Components/Landing/CustomCursor';
import ChatWidget from '@/Components/Landing/ChatWidget';
import { AnimatePresence } from 'framer-motion';

interface Props {
    children: ReactNode;
}

const LandingLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="landing-page" style={{ backgroundColor: 'var(--bg-color)' }}>
            <CustomCursor />
            <Header />
            <AnimatePresence mode="wait">
                {children}
            </AnimatePresence>
            <ChatWidget />
            <Footer />
        </div>
    );
};

export default LandingLayout;
