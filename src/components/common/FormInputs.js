import React from 'react';

export function Input({ label, ...props }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                {...props}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition placeholder-gray-400 text-base bg-white"
            />
        </div>
    );
}

export function Textarea({ label, ...props }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <textarea
                {...props}
                rows="4"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition placeholder-gray-400 text-base bg-white"
            />
        </div>
    );
}

export function Select({ label, children, ...props }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <select
                {...props}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition text-base bg-white"
            >
                {children}
            </select>
        </div>
    );
} 