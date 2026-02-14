'use client';

import { useEffect, useRef } from 'react';

export default function Starfield() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Star layers for parallax effect
        const layers = [
            { stars: [], speed: 0.02, count: 200, maxSize: 1 },    // Distant (tiny, slow)
            { stars: [], speed: 0.08, count: 100, maxSize: 1.5 },  // Mid
            { stars: [], speed: 0.15, count: 50, maxSize: 2.5 },   // Close (big, fast)
        ];

        // Shooting stars
        const shootingStars = [];
        let shootingStarTimer = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);

            // Regenerate stars on resize
            layers.forEach(layer => {
                layer.stars = [];
                for (let i = 0; i < layer.count; i++) {
                    layer.stars.push({
                        x: Math.random() * window.innerWidth, // Use logical pixels for coords
                        y: Math.random() * window.innerHeight,
                        size: Math.random() * layer.maxSize + 0.5,
                        twinkleSpeed: 0.005 + Math.random() * 0.02,
                        twinkleOffset: Math.random() * Math.PI * 2,
                        hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? 220 : 30) : 0,
                    });
                }
            });
        };

        window.addEventListener('resize', resize);
        resize();

        let time = 0;

        function animate() {
            time += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw nebula gradient overlay
            const w = window.innerWidth;
            const h = window.innerHeight;

            const grad = ctx.createRadialGradient(
                w * 0.3, h * 0.7, 0,
                w * 0.3, h * 0.7, w * 0.8
            );
            grad.addColorStop(0, 'rgba(100, 30, 120, 0.08)');
            grad.addColorStop(0.5, 'rgba(40, 20, 80, 0.05)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Second nebula patch
            const grad2 = ctx.createRadialGradient(
                w * 0.7, h * 0.3, 0,
                w * 0.7, h * 0.3, w * 0.6
            );
            grad2.addColorStop(0, 'rgba(30, 60, 140, 0.06)');
            grad2.addColorStop(0.5, 'rgba(60, 20, 100, 0.04)');
            grad2.addColorStop(1, 'transparent');
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, w, h);

            // Draw stars per layer
            layers.forEach((layer) => {
                layer.stars.forEach((star) => {
                    // Twinkle effect
                    const brightness = Math.max(0, 0.4 + 0.6 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
                    const radius = Math.max(0.1, star.size * brightness);

                    if (star.hue > 0) {
                        ctx.fillStyle = `hsla(${star.hue}, 80%, ${60 + brightness * 30}%, ${brightness})`;
                    } else {
                        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                    }

                    ctx.beginPath();
                    ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Glow for bigger stars
                    if (star.size > 1.5) {
                        ctx.fillStyle = `rgba(200, 200, 255, ${brightness * 0.15})`;
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Slowly drift
                    star.y -= layer.speed;
                    if (star.y < -5) {
                        star.y = h + 5;
                        star.x = Math.random() * w;
                    }
                });
            });

            // Shooting Stars
            shootingStarTimer++;
            if (shootingStarTimer > 180 + Math.random() * 300) {
                shootingStarTimer = 0;
                shootingStars.push({
                    x: Math.random() * w,
                    y: Math.random() * h * 0.5,
                    vx: 4 + Math.random() * 4,
                    vy: 2 + Math.random() * 3,
                    life: 1,
                    length: 40 + Math.random() * 60,
                });
            }

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 0.015;

                const gradient = ctx.createLinearGradient(
                    s.x, s.y,
                    s.x - s.vx * (s.length / s.vx), s.y - s.vy * (s.length / s.vx)
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * (s.length / s.vx), s.y - s.vy * (s.length / s.vx));
                ctx.stroke();

                if (s.life <= 0) {
                    shootingStars.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resize);
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
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0b2e 30%, #1a0a2e 60%, #0a0a1a 100%)',
            }}
        />
    );
}
