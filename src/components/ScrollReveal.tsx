"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Element entered the viewport -> Animate it IN
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                } else {
                    // Element left the viewport -> Reset it back to OUT
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        const currentRef = elementRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [delay]); // Removed the unobserve cleanup inside the callback

    return (
        <div
            ref={elementRef}
            className={`transition-all duration-700 ease-out will-change-transform ${isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-[0.98]"
                } ${className}`}
        >
            {children}
        </div>
    );
}