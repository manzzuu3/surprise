'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimate } from 'framer-motion';
import Player from './Player';
import Hoop from './Hoop';
import styles from './Game.module.css';

export default function Game() {
    const [message, setMessage] = useState('');
    const [isShooting, setIsShooting] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scope, animate] = useAnimate();

    // Drag State
    const ballX = useMotionValue(0);
    const ballY = useMotionValue(0);
    // Derive rotation from drag position for flair
    const rotate = useTransform(ballX, [-100, 100], [-45, 45]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Refs for Hoops to trigger swish
    const hoopYesRef = useRef(null);
    const hoopNoRef = useRef(null);

    // Evasive Logic (State) & Trajectory (MotionValues)
    const [isEvading, setIsEvading] = useState(false);

    // Trajectory Visualization (Slingshot)
    // SVG is HUGE (2000x2000) to prevent clipping. Center is (1000, 1000).
    // Dragging down (y+) -> Shoot up (y-)
    const trajEndX = useTransform(ballX, (x) => 1000 + x * -4);
    const trajEndY = useTransform(ballY, (y) => 1000 + y * -4);

    // Z-Index magic: Ball starts high (100). When shooting, we wait for apex, then drop z-index 
    // to sit INSIDE the hoop (between backboard and front rim).
    // Hoop z-index is 10. FrontRim is +20 (total 30). Net is 0 (total 10).
    const ballZIndex = useMotionValue(100);

    // Opacity: Show when dragging away from center, BUT HIDE when shooting
    const trajOpacity = useTransform([ballX, ballY], ([x, y]) => {
        if (isShooting) return 0;
        const dist = Math.sqrt(x * x + y * y);
        return dist > 20 ? 1 : 0;
    });

    // Monitor drag for evasion (aiming at NO hoop)
    useEffect(() => {
        const checkAim = () => {
            if (isShooting) return;

            const x = ballX.get();
            const y = ballY.get(); // Positive y is DOWN

            // Evasion trigger: aiming at No (Right). So Drag X < 0.
            if (x < -20) {
                if (!isEvading) setIsEvading(true);
            } else {
                if (isEvading) setIsEvading(false);
            }
        };

        const unsubscribeX = ballX.on("change", checkAim);
        const unsubscribeY = ballY.on("change", checkAim);
        return () => { unsubscribeX(); unsubscribeY(); };
    }, [ballX, ballY, isShooting, isEvading]);

    // Animate No Hoop Evasion (same as before)
    useEffect(() => {
        if (isEvading) {
            animate("#hoop-no", {
                x: [0, 50, -50, 20, 0],
                y: [0, -20, 20, 0],
                scale: [1, 0.8, 0.9, 0.5, 0.8],
                rotate: [0, 5, -5, 0]
            }, { duration: 0.5, repeat: Infinity });
        } else {
            animate("#hoop-no", { x: 0, y: 0, scale: 1, rotate: 0 }, { duration: 0.3 });
        }
    }, [isEvading, animate]);

    const handleDragEnd = async (event, info) => {
        setIsEvading(false);
        if (isShooting) return;

        const x = ballX.get();
        const y = ballY.get();
        const dist = Math.sqrt(x * x + y * y);

        // Slingshot Trigger
        if (dist > 40 && y > 10) {
            setIsShooting(true);

            const isAimingRight = x < 0;
            const hoopYes = document.getElementById('hoop-yes').getBoundingClientRect();
            const hoopNo = document.getElementById('hoop-no').getBoundingClientRect();
            const targetType = isAimingRight ? 'no' : 'yes';
            const targetHoop = isAimingRight ? hoopNo : hoopYes;

            // Coords
            const ballElem = document.getElementById('ball');
            const startRect = ballElem.getBoundingClientRect();
            const startCx = startRect.left + startRect.width / 2;
            const startCy = startRect.top + startRect.height / 2;
            const targetCx = targetHoop.left + targetHoop.width / 2;
            const targetCy = targetHoop.top + 80; // Aim slightly lower to be "in" net
            const deltaX = targetCx - startCx;
            const deltaY = targetCy - startCy;
            const apexY = deltaY - 400; // Higher arc

            // 1. FLY TO APEX
            const duration = 0.6;

            animate(ballX, deltaX, { duration: duration, ease: "linear" });
            animate("#ball", { rotate: x < 0 ? 720 : -720 }, { duration: duration });

            // Split Y into Up and Down for control
            await animate(ballY, apexY, { duration: duration * 0.5, ease: "easeOut" });

            // AT APEX: Switch Z-Index to be BEHIND the front rim
            ballZIndex.set(15);

            // Phase 2: Drop into net
            await animate(ballY, deltaY, { duration: duration * 0.5, ease: "easeIn" });

            if (targetType === 'yes') {
                setMessage("SWISH! ❤️");
                if (hoopYesRef.current) hoopYesRef.current.triggerSwish();

                // 3. DUNK/PASS THROUGH
                await Promise.all([
                    animate(ballY, deltaY + 150, { duration: 0.3, ease: "linear" }),
                    animate("#ball", { scale: 0.5, opacity: 0 }, { duration: 0.3 })
                ]);

            } else {
                setMessage("Impossible!");
                ballZIndex.set(100); // Bounce off rim (bring front)
                const bounceX = Math.random() > 0.5 ? 60 : -60;
                await animate(ballX, deltaX + bounceX, { duration: 0.5, ease: "linear" });
                await animate(ballY, deltaY + 300, { duration: 0.5, ease: "easeOut" });
                await animate("#ball", { opacity: 0 }, { duration: 0.2 });
            }

            // Reset
            ballX.set(0);
            ballY.set(0);
            ballZIndex.set(100);
            animate("#ball", { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }, { duration: 0 });
            setIsShooting(false);
            setMessage("");

        } else {
            animate(ballX, 0);
            animate(ballY, 0);
        }
    };

    return (
        <div className={styles.gameContainer} ref={scope}>
            {/* 3D Room Elements */}
            <div
                className={styles.room}
                style={{
                    transform: `perspective(1000px) rotateY(${mousePos.x * 2}deg) rotateX(${-mousePos.y * 2}deg)`
                }}
            >
                <div className={styles.wallLeft}></div>
                <div className={styles.wallRight}></div>
                <div className={styles.wallBack}></div>
                <div className={styles.floor}></div>

                {/* Background Elements */}
                <div className={styles.mainTitle}>Will you be my Valentine?</div>

                <div className={styles.bgEmoji} style={{ top: '10%', left: '10%' }}>🧸</div>
                <div className={styles.bgEmoji} style={{ top: '15%', right: '15%', animationDelay: '1s' }}>❤️</div>
                <div className={styles.bgEmoji} style={{ top: '60%', left: '20%', animationDelay: '2s' }}>🧸</div>
                <div className={styles.bgEmoji} style={{ top: '50%', right: '10%', animationDelay: '3s' }}>❤️</div>

                <div className={styles.hoopsWrapper}>
                    <Hoop ref={hoopYesRef} type="yes" id="hoop-yes" onClick={() => { }} />
                    <Hoop ref={hoopNoRef} type="no" id="hoop-no" onClick={() => { }} />
                </div>

                {/* PLAYER */}
                <Player isShooting={isShooting} />

                {/* DRAGGABLE BALL & TRAJECTORY */}
                {/* DRAGGABLE BALL & TRAJECTORY */}
                <motion.div className={styles.ballWrapper} style={{ zIndex: ballZIndex }}>
                    <motion.svg
                        className={styles.trajectorySvg}
                        style={{ opacity: trajOpacity, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                        viewBox="0 0 2000 2000"
                    >
                        {/* Dashed line pointing in direction of drag */}
                        <motion.line
                            x1="1000" y1="1000"
                            x2={trajEndX} y2={trajEndY}
                            stroke="#ff0055"
                            strokeWidth="10"
                            strokeDasharray="15,15"
                            strokeLinecap="round"
                        />
                        {/* Arrowhead */}
                        <motion.circle cx={trajEndX} cy={trajEndY} r="12" fill="#ff0055" />
                    </motion.svg>

                    <motion.div
                        id="ball"
                        className={styles.ball}
                        drag={!isShooting} // Disable drag while shooting!
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        style={{ x: ballX, y: ballY, rotate, cursor: isShooting ? 'default' : 'grab' }}
                        whileTap={{ cursor: 'grabbing', scale: 1.1 }}
                    >
                        <div className={styles.ballTexture}></div>
                    </motion.div>
                </motion.div>
            </div>

            <div className={styles.message}>{message}</div>
        </div>
    );
}
