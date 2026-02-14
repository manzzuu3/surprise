import { motion } from 'framer-motion';
import styles from './Player.module.css';

export default function Player({ isShooting }) {
    // Enhanced Cute Bear
    // Arms animate based on isShooting prop

    return (
        <div className={styles.playerContainer}>
            <motion.div
                className={styles.bear}
                animate={isShooting ? { y: -10, scale: 1.05 } : { y: [0, -5, 0] }}
                transition={isShooting ? { duration: 0.2 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
                <div className={styles.ears}>
                    <div className={styles.earLeft}></div>
                    <div className={styles.earRight}></div>
                </div>

                <div className={styles.head}>
                    <div className={styles.eyes}>
                        <div className={styles.eye}></div>
                        <div className={styles.eye}></div>
                    </div>
                    <div className={styles.cheeks}>
                        <div className={styles.cheek}></div>
                        <div className={styles.cheek}></div>
                    </div>
                    <div className={styles.snout}>
                        <div className={styles.nose}></div>
                        <div className={styles.mouth}></div>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.belly}></div>
                </div>

                <motion.div
                    className={styles.armLeft}
                    animate={isShooting ? { rotate: -150, x: 15, y: -25 } : { rotate: -20, x: 0, y: 0 }}
                ></motion.div>
                <motion.div
                    className={styles.armRight}
                    animate={isShooting ? { rotate: 150, x: -15, y: -25 } : { rotate: 20, x: 0, y: 0 }}
                ></motion.div>

                <div className={styles.legs}>
                    <div className={styles.leg}></div>
                    <div className={styles.leg}></div>
                </div>
            </motion.div>
        </div>
    );
}
