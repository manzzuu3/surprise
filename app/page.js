'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HeartCursor from '@/components/HeartCursor';
import MusicPlayer from '@/components/MusicPlayer';
import Envelope from '@/components/Envelope';
import Starfield from '@/components/Starfield';

export default function Home() {
    const router = useRouter();
    const [showEnvelope, setShowEnvelope] = useState(true);
    const [showSolarSystem, setShowSolarSystem] = useState(false);

    // Orbital System Ref
    const systemRef = useRef(null);
    const requestRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    // Planets State
    const planetsRef = useRef([
        { id: 'mercury', angle: 0, speed: 0.008, radiusX: 120, radiusY: 40, size: 40, type: 'mercury', z: 0, scale: 1 },
        { id: 'venus', angle: 2, speed: 0.006, radiusX: 190, radiusY: 65, size: 50, type: 'venus', z: 0, scale: 1 },
        { id: 'earth', angle: 4, speed: 0.004, radiusX: 270, radiusY: 95, size: 70, type: 'earth', z: 0, scale: 1, isYes: true },
        { id: 'mars', angle: 1, speed: 0.003, radiusX: 340, radiusY: 120, size: 45, type: 'mars', z: 0, scale: 1 },
        { id: 'jupiter', angle: 5, speed: 0.0015, radiusX: 490, radiusY: 170, size: 100, type: 'jupiter', z: 0, scale: 1 },
        { id: 'saturn', angle: 3, speed: 0.003, radiusX: 500, radiusY: 175, size: 90, type: 'saturn', z: 0, scale: 1, isNo: true, invulnerable: true, fleeing: false, fleeX: 0, fleeY: 0, fleeVx: 0, fleeVy: 0 }
    ]);
    const planetDomsRef = useRef({});

    // Asteroids State
    const asteroidsRef = useRef([]);
    const asteroidDomsRef = useRef([]);

    // Initialize Asteroids
    useEffect(() => {
        const asteroids = [];
        const count = 150;
        const radiusX = 400; // Between Mars (340) and Jupiter (490)
        const radiusY = 140;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const size = Math.random() * 3 + 1;
            const variance = (Math.random() - 0.5) * 40; // band width
            asteroids.push({
                x: 0, y: 0,
                angle,
                speed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
                radiusX: radiusX + variance,
                radiusY: radiusY + variance * 0.3,
                size,
                z: 0
            });
        }
        asteroidsRef.current = asteroids;
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchstart', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
        };
    }, []);

    const animate = useCallback(() => {
        if (!systemRef.current) {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        const rect = systemRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Responsive Scaling - match SVG viewBox (1500x800) aspect ratio
        const scaleFactor = Math.min(rect.width / 1500, rect.height / 800);

        // 1. Animate Asteroids
        asteroidsRef.current.forEach((a, i) => {
            const dom = asteroidDomsRef.current[i];
            if (!dom) return;

            a.angle += a.speed;
            const rx = a.radiusX * scaleFactor;
            const ry = a.radiusY * scaleFactor;
            const px = Math.cos(a.angle) * rx;
            const py = Math.sin(a.angle) * ry;

            const zDepth = Math.sin(a.angle);
            const scale = 0.6 + (zDepth + 1) * 0.2;
            const brightness = 0.4 + (zDepth + 1) * 0.3;
            // Asteroids behind planets generally
            const zIndex = Math.floor((zDepth + 1) * 40);

            dom.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
            dom.style.zIndex = zIndex;
            dom.style.filter = `brightness(${brightness})`;
            dom.style.opacity = 0.7;
        });

        // 2. Animate Planets
        planetsRef.current.forEach(p => {
            const dom = planetDomsRef.current[p.id];
            if (!dom) return;

            // Logic Update
            if (p.isNo && p.fleeing) {
                // Flee Logic
                const dx = p.fleeX - mouseRef.current.x;
                const dy = p.fleeY - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const REPULSION = 180;

                if (dist < REPULSION * 1.5) {
                    const force = (1 - dist / (REPULSION * 1.5)) * 2.5;
                    // Push away
                    p.fleeVx += (dx / (dist || 0.1)) * force * 5;
                    p.fleeVy += (dy / (dist || 0.1)) * force * 5;
                }

                p.fleeVx *= 0.94; // friction
                p.fleeVy *= 0.94;

                p.fleeX += p.fleeVx;
                p.fleeY += p.fleeVy;

                // Bounce
                if (p.fleeX < 50 || p.fleeX > window.innerWidth - 50) p.fleeVx *= -0.8;
                if (p.fleeY < 50 || p.fleeY > window.innerHeight - 50) p.fleeVy *= -0.8;

                // Return condition
                // If slow enough and far enough, or if we want it to return when user leaves?
                // Lets make it return if it's far from the mouse
                if (dist > 300 && Math.abs(p.fleeVx) < 0.5 && Math.abs(p.fleeVy) < 0.5) {
                    p.fleeing = false;
                    // Snap back to orbit angle based on current position relative to sun
                    const relX = (p.fleeX - cx) / scaleFactor;
                    const relY = (p.fleeY - cy) / scaleFactor;
                    // Approximate angle
                    p.angle = Math.atan2(relY / p.radiusY, relX / p.radiusX);
                }

                const halfW = (p.size + 40) / 2; // size + padding
                dom.style.transform = `translate(${p.fleeX - cx - halfW}px, ${p.fleeY - cy - halfW}px) scale(${p.scale})`;
                dom.style.zIndex = 100; // Always top when fleeing

            } else {
                // Check for hover slow-down (Yes planet)
                let currentSpeed = p.speed;
                if (p.isYes) {
                    const rx = p.radiusX * scaleFactor;
                    const ry = p.radiusY * scaleFactor;
                    const px = Math.cos(p.angle) * rx;
                    const py = Math.sin(p.angle) * ry;
                    const screenX = cx + px; // approximate
                    const screenY = cy + py;
                    const dx = screenX - mouseRef.current.x;
                    const dy = screenY - mouseRef.current.y;
                    const distToMouse = Math.sqrt(dx * dx + dy * dy);

                    if (distToMouse < 80) {
                        currentSpeed = p.speed * 0.05; // Slow down massively for click
                        dom.style.cursor = 'pointer';
                    }

                    // Add hover scale
                    if (distToMouse < 50) {
                        p.scale *= 1.1;
                    }
                }

                // Orbit Logic
                p.angle += currentSpeed;

                const rx = p.radiusX * scaleFactor;
                const ry = p.radiusY * scaleFactor;
                const px = Math.cos(p.angle) * rx;
                const py = Math.sin(p.angle) * ry;

                const zDepth = Math.sin(p.angle); // -1 (back) to 1 (front)
                p.scale = 0.8 + (zDepth + 1) * 0.2; // 0.8 to 1.2
                p.z = Math.floor((zDepth + 1) * 50); // 0 to 100
                p.brightness = 0.6 + (zDepth + 1) * 0.2; // 0.6 to 1.0

                // Check NO Planet Trigger
                if (p.isNo) {
                    const screenX = cx + px; // approximate
                    const screenY = cy + py;
                    const dx = screenX - mouseRef.current.x;
                    const dy = screenY - mouseRef.current.y;
                    if (!p.invulnerable && Math.sqrt(dx * dx + dy * dy) < 85) { // Trigger radius
                        p.fleeing = true;
                        p.fleeX = screenX;
                        p.fleeY = screenY;
                        // Initial flee vector away from mouse
                        const nx = dx / (Math.sqrt(dx * dx + dy * dy) || 1);
                        const ny = dy / (Math.sqrt(dx * dx + dy * dy) || 1);
                        p.fleeVx = nx * 10;
                        p.fleeVy = ny * 10;
                    }
                }

                const halfSize = (p.size + 40) / 2; // size + padding
                dom.style.transform = `translate(${px - halfSize}px, ${py - halfSize}px) scale(${p.scale})`;
                dom.style.zIndex = p.z;
                dom.style.filter = `brightness(${p.brightness})`;
            }
        });

        requestRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (showSolarSystem) {
            // Grace period so Saturn doesn't flee immediately on load
            const timer = setTimeout(() => {
                const saturn = planetsRef.current.find(p => p.id === 'saturn');
                if (saturn) saturn.invulnerable = false;
            }, 2000);

            requestRef.current = requestAnimationFrame(animate);
            return () => {
                cancelAnimationFrame(requestRef.current);
                clearTimeout(timer);
            };
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [showSolarSystem, animate]);

    const handleYesClick = () => router.push('/yes');

    const handleEnvelopeOpen = () => {
        setShowEnvelope(false);
        setTimeout(() => setShowSolarSystem(true), 400);
    };

    return (
        <>
            <Starfield />
            <HeartCursor />
            <MusicPlayer />

            <div className="main-container">
                <AnimatePresence mode="wait">
                    {showEnvelope && (
                        <motion.div
                            key="envelope"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
                            transition={{ duration: 0.8 }}
                            style={{ position: 'relative', zIndex: 100 }}
                        >
                            <Envelope onOpen={handleEnvelopeOpen} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {showSolarSystem && (
                    <div ref={systemRef} className="solar-system-container">

                        {/* ☀️ SUN - CSS Sphere */}
                        <div className="sun-sphere">
                            <div className="sun-atmosphere"></div>
                        </div>

                        {/* Orbit Paths (SVG for smoothness) */}
                        <svg className="orbits-svg" width="100%" height="100%" viewBox="-750 -400 1500 800">
                            {/* Calculated based on radii */}
                            <ellipse cx="0" cy="0" rx="120" ry="40" className="orbit-path" />
                            <ellipse cx="0" cy="0" rx="190" ry="65" className="orbit-path" />
                            <ellipse cx="0" cy="0" rx="270" ry="95" className="orbit-path-active" />
                            <ellipse cx="0" cy="0" rx="340" ry="120" className="orbit-path" />
                            <ellipse cx="0" cy="0" rx="400" ry="140" className="orbit-path" strokeDasharray="4 4" style={{ opacity: 0.3 }} /> {/* Asteroid belt */}
                            <ellipse cx="0" cy="0" rx="490" ry="170" className="orbit-path" />
                            <ellipse cx="0" cy="0" rx="500" ry="175" className="orbit-path" />
                        </svg>

                        {/* 🌑 ASTEROIDS */}
                        {asteroidsRef.current.map((a, i) => (
                            <div
                                key={`asteroid-${i}`}
                                ref={el => asteroidDomsRef.current[i] = el}
                                className="asteroid"
                                style={{ width: a.size, height: a.size }}
                            />
                        ))}

                        {/* 🪐 PLANETS */}
                        {planetsRef.current.map(p => (
                            <div
                                key={p.id}
                                ref={el => planetDomsRef.current[p.id] = el}
                                className={`planet-wrapper ${p.id}-wrapper`}
                                style={{ width: p.size + 40, height: p.size + 40 }}
                                onClick={p.isYes ? handleYesClick : undefined}
                            >
                                <div className={`planet-sphere planet-${p.type}`}>
                                    {/* Texture / Ring features */}
                                    {p.type === 'saturn' && <div className="planet-ring"></div>}
                                    {p.type === 'earth' && <div className="planet-clouds"></div>}
                                    {p.type === 'jupiter' && <div className="planet-bands"></div>}
                                </div>
                                {p.isYes && <div className="planet-label yes-label">YES! 💖</div>}
                                {p.isNo && <div className="planet-label no-label">No 😅</div>}
                            </div>
                        ))}

                        <div className="solar-text">
                            <h1>Will You Be My Valentine?</h1>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
