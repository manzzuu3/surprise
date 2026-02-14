'use client';

import { useState } from 'react';
import styles from './Envelope.module.css';

export default function Envelope({ onOpen }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        if (isOpen) return;
        setIsOpen(true);
        setTimeout(() => {
            onOpen();
        }, 1500);
    };

    return (
        <div
            className={`${styles.container} ${isOpen ? styles.open : ''}`}
            onClick={handleOpen}
        >
            <div className={styles.letter}>
                <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '26px', color: '#e84393', marginBottom: '4px' }}>
                    A Message From the Stars ✨
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(200,200,230,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Tap to Open
                </div>
            </div>

            <div className={styles.pocket}></div>
            <div className={styles.pocketSides}></div>
            <div className={styles.pocketRight}></div>
            <div className={styles.pocketFront}></div>

            <div className={styles.flap}></div>

            <div className={styles.seal}>🪐</div>
        </div>
    );
}
