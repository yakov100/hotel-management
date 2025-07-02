import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAppState() {
    const [activeView, setActiveView] = useState('bookings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [showCreateApartmentModal, setShowCreateApartmentModal] = useState(false);

    // Debug state changes
    useEffect(() => {
        console.log('showCreateApartmentModal state changed to:', showCreateApartmentModal);
    }, [showCreateApartmentModal]);

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const handleProjectSelect = useCallback((projectId) => {
        setCurrentProjectId(projectId);
    }, []);

    const handleChatToggle = useCallback(() => {
        setIsChatOpen(!isChatOpen);
    }, [isChatOpen]);

    const handleCreateApartment = useCallback(() => {
        console.log('handleCreateApartment called!');
        console.log('Current showCreateApartmentModal state:', showCreateApartmentModal);
        setShowCreateApartmentModal(true);
        console.log('Setting showCreateApartmentModal to true');
    }, [showCreateApartmentModal]);

    const handleApartmentCreated = useCallback(() => {
        setShowCreateApartmentModal(false);
    }, []);

    return {
        // State
        activeView,
        isSidebarOpen,
        error,
        currentProjectId,
        isChatOpen,
        unreadMessages,
        lastMessageCount,
        showCreateApartmentModal,
        // Setters
        setActiveView,
        setIsSidebarOpen,
        setError,
        setCurrentProjectId,
        setIsChatOpen,
        setUnreadMessages,
        setLastMessageCount,
        setShowCreateApartmentModal,
        // Handlers
        handleLogout,
        handleProjectSelect,
        handleChatToggle,
        handleCreateApartment,
        handleApartmentCreated
    };
} 