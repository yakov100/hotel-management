import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            dir="rtl"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className={`
                    relative w-full ${sizeClasses[size]} max-h-[90vh] 
                    bg-white/95 backdrop-blur-xl 
                    border border-white/20 rounded-3xl 
                    shadow-2xl overflow-hidden 
                    animate-scale-in
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-3xl" />
                
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="
                        absolute top-4 left-4 z-10
                        w-10 h-10 rounded-full 
                        bg-white/80 hover:bg-white 
                        border border-primary-200/50 hover:border-primary-300
                        text-primary-600 hover:text-primary-800
                        flex items-center justify-center
                        transition-all duration-200
                        hover:scale-110 hover:shadow-lg
                        group
                    "
                    aria-label="סגור חלון"
                >
                    <svg 
                        className="w-5 h-5 transition-transform group-hover:rotate-90" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </button>
                
                {/* Content */}
                <div className="relative max-h-[90vh] overflow-y-auto p-6">
                    {children}
                </div>
                
                {/* Bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
        </div>
    );
} 