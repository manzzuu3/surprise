'use client';

import { useEffect, useState } from 'react';
import styles from './PolaroidGallery.module.css';

const MEMORIES = [
    { id: 1, caption: "Our Galaxy", emoji: "🌌", color: "linear-gradient(135deg, #1a0a3e, #3a1a6e)" },
    { id: 2, caption: "Stargazing", emoji: "⭐", color: "linear-gradient(135deg, #0d1b3e, #1a2e5e)" },
    { id: 3, caption: "Our Universe", emoji: "🪐", color: "linear-gradient(135deg, #2a0a4e, #4a1a7e)" },
    { id: 4, caption: "To the Moon", emoji: "🌙", color: "linear-gradient(135deg, #1a1a3e, #2a2a5e)" },
    { id: 5, caption: "Cosmic Love", emoji: "💫", color: "linear-gradient(135deg, #3a0a3e, #5a1a5e)" },
];

export default function PolaroidGallery() {
    const [polaroids, setPolaroids] = useState([]);

    useEffect(() => {
        const items = MEMORIES.map((m, i) => ({
            ...m,
            startX: `${Math.random() * 40 - 20}vw`,
            endX: `${Math.random() * 40 - 20}vw`,
            startRot: `${Math.random() * 30 - 15}deg`,
            endRot: `${Math.random() * 60 - 30}deg`,
            delay: i * 4,
            left: `${10 + Math.random() * 80}%`
        }));
        setPolaroids(items);
    }, []);

    return (
        <div className={styles.gallery}>
            {polaroids.map((p) => (
                <div
                    key={p.id}
                    className={styles.polaroid}
                    style={{
                        left: p.left,
                        animationDelay: `${p.delay}s`,
                        '--startX': p.startX,
                        '--endX': p.endX,
                        '--startRot': p.startRot,
                        '--endRot': p.endRot,
                    }}
                >
                    <div
                        className={styles.photo}
                        style={{ background: p.color }}
                    >
                        <span style={{ fontSize: '36px' }}>{p.emoji}</span>
                    </div>
                    <div className={styles.caption}>{p.caption}</div>
                </div>
            ))}
        </div>
    );
}
