'use client';

import { useState, useRef } from 'react';

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '10px 16px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
            <audio
                ref={audioRef}
                loop
                src="/aha_allari_allari.mp3"
            />
            <button
                onClick={togglePlay}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'transform 0.2s',
                    padding: 0
                }}
            >
                {isPlaying ? '⏸️' : '🎵'}
            </button>
            <span style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '2px'
            }}>
                {isPlaying ? 'Playing Aha Allari...' : 'Play Aha Allari'}
            </span>
        </div>
    );
}
