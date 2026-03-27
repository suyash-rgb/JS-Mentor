import React, { useEffect, useRef } from 'react';

/**
 * ScrollTracker
 * Detects when the user has scrolled to the bottom of the content.
 * @param {Function} onComplete - Callback when the bottom is reached.
 * @param {boolean} disabled - Whether tracking is disabled (e.g., already completed).
 * @param {React.ReactNode} children - The content to track.
 */
const ScrollTracker = ({ onComplete, disabled, children }) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        if (disabled) return;

        const currentTarget = observerTarget.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onComplete();
                }
            },
            { threshold: 1.0 }
        );

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [onComplete, disabled]);

    return (
        <div className="scroll-tracker-container">
            {children}
            <div 
                ref={observerTarget} 
                style={{ height: '10px', width: '100%', marginTop: '20px' }} 
                aria-hidden="true"
            />
        </div>
    );
};

export default ScrollTracker;
