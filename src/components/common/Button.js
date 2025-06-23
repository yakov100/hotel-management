import React from 'react';

export default function Button({
    children,
    onClick,
    className = "",
    disabled = false,
    type = "button",
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    ...props
}) {
    const baseClasses = "relative overflow-hidden font-medium transition-all duration-300 ease-in-out transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-accent-400";
    
    const variants = {
        primary: "bg-gradient-to-l from-purple-500 to-blue-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-0",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        ghost: "bg-transparent text-primary-600 hover:bg-white/50 hover:backdrop-blur-sm border-0",
        success: "bg-gradient-to-l from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-0",
        warning: "bg-gradient-to-l from-yellow-400 to-orange-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-0",
        error: "bg-gradient-to-l from-red-400 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-0",
        glass: "bg-white/60 backdrop-blur-lg text-primary-900 border border-white/50 hover:bg-white/80 hover:backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 font-semibold",
    };
    
    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2.5 text-sm rounded-xl",
        lg: "px-6 py-3 text-base rounded-xl",
        xl: "px-8 py-4 text-lg rounded-2xl",
    };
    
    const selectedVariant = variants[variant] || variants.primary;
    const selectedSize = sizes[size] || sizes.md;
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                group
                flex items-center justify-center gap-2
                ${baseClasses}
                ${selectedVariant}
                ${selectedSize}
                ${className}
                ${loading ? 'cursor-wait' : ''}
            `}
            {...props}
        >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-inherit pointer-events-none" />
            {/* Ripple effect on click */}
            <div className="absolute inset-0 overflow-hidden rounded-inherit">
                <div className="absolute inset-0 bg-white/20 transform scale-0 rounded-full transition-transform duration-500 group-active:scale-100" />
            </div>
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : icon && (
                    <span className="flex-shrink-0">{icon}</span>
                )}
                {children && <span>{children}</span>}
            </div>
        </button>
    );
} 