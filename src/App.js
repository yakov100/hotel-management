import React, { useEffect } from 'react';
import { suppressBrowserExtensionErrors, logBrowserExtensionWarning } from './utils/errorUtils';
import { ApartmentProvider } from './context/ApartmentContext';
import { TaskProvider } from './context/TaskContext';
import AppContent from './components/AppContent';

// Main App component with providers
export default function App() {
    // Global error handler for browser extension interference
    useEffect(() => {
        const cleanup = suppressBrowserExtensionErrors();
        
        // Log warning once on app startup
        const timer = setTimeout(() => {
            logBrowserExtensionWarning();
        }, 2000);

        return () => {
            cleanup();
            clearTimeout(timer);
        };
    }, []);

    return (
        <ApartmentProvider>
            <TaskProvider>
                <AppContent />
            </TaskProvider>
        </ApartmentProvider>
    );
} 