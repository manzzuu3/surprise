'use client';

import { useEffect, useRef } from 'react';

export default function StarCursor() {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const STAR_CHARS = ['✦', '✧', '⋆', '✨', '·'];
        const COLORS = [
            'rgba(249, 202, 36, 0.9)',   // Gold
            'rgba(255, 255, 255, 0.9)',   // White
            'rgba(162, 155, 254, 0.8)',   // Lavender
            'rgba(232, 67, 147, 0.7)',    // Pink
            'rgba(52, 152, 219, 0.7)',    // Blue
        ];

        const onMouseMove = (e) => {
            // Add 2-3 particles per move for a denser trail
            for (let j = 0; j < 2; j++) {
                const size = Math.random() * 14 + 6;
                particlesRef.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 8,
                    y: e.clientY + (Math.random() - 0.5) * 8,
                    size,
                    speedX: (Math.random() - 0.5) * 1.2,
                    speedY: Math.random() * -1.5 - 0.3,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
                    life: 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 5,
                });
            }
        };
        window.addEventListener('mousemove', onMouseMove);

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesRef.current.length; i++) {
                const p = particlesRef.current[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life -= 0.018;
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.font = `${p.size}px serif`;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.char, 0, 0);
                ctx.restore();

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    i--;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}
