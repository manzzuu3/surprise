'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HeartCursor from '@/components/HeartCursor';
import MusicPlayer from '@/components/MusicPlayer';

import Starfield from '@/components/Starfield';

const LOVE_QUOTES = [
    "You are my entire universe. 🌌💕",
    "I'd cross every galaxy to find you. 🚀✨",
    "My heart orbits around you. 🪐💖",
    "You are the brightest star in my sky. ⭐🥰",
    "Together we're an unstoppable constellation. 💫",
    "I love you to the moon and back... and beyond! 🌙",
    "You're the gravity that keeps me grounded. 🌍❤️",
];

const SPACE_OBJECTS = ['⭐', '✨', '💫', '🌟', '✦', '🪐', '🌙', '💕'];

export default function YesPage() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [floatingElements, setFloatingElements] = useState([]);

    useEffect(() => {
        // Hydration fix: Generate floating elements on client mount
        const elements = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // %
            top: Math.random() * 100, // % - spread vertically too? Or float up?
            // Actually, if we use strict "top: 100%", they start below. 
            // Let's create varying starting positions to avoid initial clustering.
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 15, // slower float
            size: 14 + Math.random() * 24,
            char: SPACE_OBJECTS[Math.floor(Math.random() * SPACE_OBJECTS.length)]
        }));
        setFloatingElements(elements);

        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % LOVE_QUOTES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="celebration-container">
            <Starfield />
            <HeartCursor />
            <MusicPlayer />

            {/* Floating space objects */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
                {floatingElements.map((el) => (
                    <div
                        key={el.id}
                        className="floating-heart"
                        style={{
                            left: `${el.left}%`,
                            // We set animation-delay, but if we want them scattered initially,
                            // CSS animation starts at 0%. 
                            // To avoid "bunching at bottom", we rely on delay.
                            // Or we could randomize `top` but `floating-heart` animation usually starts from off-screen bottom?
                            // Let's check CSS. Assuming .floating-heart animates `top: 100% -> -10%`.
                            animationDuration: `${el.duration}s`,
                            animationDelay: `${el.delay}s`,
                            fontSize: `${el.size}px`,
                        }}
                    >
                        {el.char}
                    </div>
                ))}
            </div>


            {/* Main Content */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
                style={{ zIndex: 100, position: 'relative' }}
            >
                <h1 className="yay-text">To the Moon & Beyond! 🚀🌙</h1>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    className="quote-box"
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    style={{ zIndex: 100, position: 'relative' }}
                >
                    <p className="love-quote">{LOVE_QUOTES[quoteIndex]}</p>
                </motion.div>
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                style={{ zIndex: 100, position: 'relative' }}
            >
                <Link href="/" className="back-link">
                    ← Travel back through space 😘
                </Link>
            </motion.div>
        </div>
    );
}
