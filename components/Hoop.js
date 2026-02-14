import { forwardRef, useImperativeHandle, useState } from 'react';
import styles from './Hoop.module.css';

const Hoop = forwardRef(({ type, onClick, id }, ref) => {
    // id is used to get position for trajectory
    const [isSwishing, setIsSwishing] = useState(false);

    useImperativeHandle(ref, () => ({
        triggerSwish: () => {
            setIsSwishing(true);
            setTimeout(() => setIsSwishing(false), 500); // Reset after animation
        }
    }));

    return (
        <div id={id} className={`${styles.hoopContainer} ${styles[type]}`} onClick={onClick}>
            <div className={styles.backboard}>
                <div className={styles.innerSquare}></div>
            </div>
            <div className={styles.rimWrapper}>
                <div className={`${styles.net} ${isSwishing ? styles.netSwish : ''}`}></div>
                <div className={styles.rimBack}></div>
                <div className={styles.rimFront}></div>
            </div>
            <div className={styles.post}></div>

            <div className={styles.label} style={{ color: type === 'yes' ? 'var(--accent-yes)' : 'var(--accent-no)' }}>
                {type.toUpperCase()}
            </div>
        </div>
    );
});

Hoop.displayName = "Hoop";
export default Hoop;
