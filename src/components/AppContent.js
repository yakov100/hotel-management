import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import Auth from './Auth';
import AppLayout from './AppLayout';
import CreateApartmentModal from './CreateApartmentModal';
import ViewRenderer from './app/ViewRenderer';
import { ApartmentLoadingState, NoApartmentsState } from './app/LoadingStates';
import { useApartment } from '../context/ApartmentContext';
import { useAppState } from '../hooks/useAppState';
import { useDataHandlers } from '../hooks/useDataHandlers';
import { useAppData } from '../hooks/useAppData';

export default function AppContent() {
    const appState = useAppState();
    const {
        activeView,
        setActiveView,
        currentProjectId,
        showCreateApartmentModal,
        setCurrentProjectId,
        handleProjectSelect,
        handleCreateApartment,
        handleApartmentCreated,
        setShowCreateApartmentModal
    } = appState;

    // State for sidebar and chat
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages] = useState(0);
    const [isFixingAssociation, setIsFixingAssociation] = useState(false);

    // Use apartment context
    const { 
        user, 
        selectedApartment, 
        loading: apartmentLoading,
        userApartments,
        hasPermission,
        refreshUserApartments
    } = useApartment();

    const apartmentId = selectedApartment?.id;
    const settings = selectedApartment?.settings || null;

    // Data collections
    const appData = useAppData(apartmentId);
    
    // Data handlers
    const dataHandlers = useDataHandlers(apartmentId, hasPermission);

    // App handlers for ViewRenderer
    const appHandlers = {
        currentProjectId,
        handleProjectSelect
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            // Clear any pending operations first
            setIsFixingAssociation(false);
            setCurrentProjectId(null);
            
            await signOut(auth);
            console.log('User signed out successfully');
            
            // Force page reload to clear all state and avoid permission errors
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (error) {
            console.error('Logout error:', error);
            // Force reload on any error
            window.location.reload();
        }
    };

    // Chat handlers
    const handleChatToggle = () => {
        setIsChatOpen(!isChatOpen);
    };

    // עדכון הפרויקט הנוכחי כאשר נטען הפרויקט הראשון
    useEffect(() => {
        if (appData.bookings && appData.bookings.length > 0 && !currentProjectId) {
            setCurrentProjectId(appData.bookings[0].id);
        }
    }, [appData.bookings, currentProjectId, setCurrentProjectId]);

    // Auto-open apartment creation modal when user has no apartments
    useEffect(() => {
        console.log('AppContent effect - checking apartments:', {
            userApartmentsLength: userApartments.length,
            apartmentLoading,
            user: !!user,
            showCreateApartmentModal
        });
        
        // TEMPORARILY DISABLED: Auto-opening modal to allow user to access the app
        // TODO: Re-enable after fixing user-apartment association
        /*
        if (user && !apartmentLoading && userApartments.length === 0 && !showCreateApartmentModal) {
            console.log('Auto-opening apartment creation modal - user has no apartments');
            setShowCreateApartmentModal(true);
        }
        */
    }, [user, apartmentLoading, userApartments.length, showCreateApartmentModal, setShowCreateApartmentModal]);

    // Fix user-apartment association
    const fixUserApartmentAssociation = async () => {
        if (!user) return;
        
        setIsFixingAssociation(true);
        try {
            console.log('🔧 מתקן קישור בין משתמש לדירות...');
            
            // Get all apartments where user is owner
            const apartmentsSnapshot = await getDocs(collection(db, 'apartments'));
            const ownedApartments = [];
            
            apartmentsSnapshot.forEach(apartmentDoc => {
                const apartment = apartmentDoc.data();
                if (apartment.ownerId === user.uid) {
                    ownedApartments.push({
                        id: apartmentDoc.id,
                        ...apartment
                    });
                }
            });
            
            if (ownedApartments.length > 0) {
                console.log('✅ נמצאו', ownedApartments.length, 'דירות בבעלות המשתמש');
                
                const updatedApartments = {};
                ownedApartments.forEach(apartment => {
                    updatedApartments[apartment.id] = {
                        role: 'owner',
                        permissions: [],
                        joinedAt: new Date()
                    };
                });
                
                // Update user document
                await setDoc(doc(db, 'users', user.uid), {
                    apartments: updatedApartments,
                    updatedAt: new Date()
                }, { merge: true });
                
                console.log('✅ הקישור תוקן בהצלחה!');
                
                // Refresh apartments
                await refreshUserApartments();
                
                alert('הקישור בין המשתמש לדירות תוקן בהצלחה! 🎉');
            } else {
                console.log('❌ לא נמצאו דירות בבעלות המשתמש');
                alert('לא נמצאו דירות בבעלותך במערכת. אנא צור דירה חדשה.');
            }
            
        } catch (error) {
            console.error('❌ שגיאה בתיקון הקישור:', error);
            alert('שגיאה בתיקון הקישור: ' + error.message);
        } finally {
            setIsFixingAssociation(false);
        }
    };

    // Show authentication screen if user is not logged in
    if (!user) {
        return <Auth onAuthSuccess={() => {}} />;
    }

    // Show loading while apartment data loads
    if (apartmentLoading) {
        return <ApartmentLoadingState />;
    }

    // TEMPORARILY DISABLED: Show apartment creation if no apartments
    // This allows user to access the app even without apartments
    // TODO: Re-enable after fixing user-apartment association
    /*
    if (userApartments.length === 0) {
        console.log('Rendering NoApartmentsState with modal state:', showCreateApartmentModal);
        return (
            <div style={{ position: 'relative' }}>
                <NoApartmentsState onCreateApartment={handleCreateApartment} />
                <CreateApartmentModal
                    isOpen={showCreateApartmentModal}
                    onClose={() => {
                        console.log('CreateApartmentModal onClose called from NoApartmentsState');
                        setShowCreateApartmentModal(false);
                    }}
                    onSuccess={() => {
                        console.log('CreateApartmentModal onSuccess called from NoApartmentsState');
                        handleApartmentCreated();
                    }}
                />
            </div>
        );
    }
    */

    // Show debug panel if user has no apartments
    if (userApartments.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">ברוך הבא! 👋</h2>
                        <p className="text-gray-600">נראה שאין לך דירות רשומות במערכת</p>
                    </div>
                    
                    <div className="space-y-4">
                        <button
                            onClick={fixUserApartmentAssociation}
                            disabled={isFixingAssociation}
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isFixingAssociation ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                                    מתקן קישור לדירות...
                                </>
                            ) : (
                                '🔧 תקן קישור לדירות קיימות'
                            )}
                        </button>
                        
                        <button
                            onClick={handleCreateApartment}
                            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            ➕ צור דירה חדשה
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            התנתק
                        </button>
                    </div>
                    
                    <CreateApartmentModal
                        isOpen={showCreateApartmentModal}
                        onClose={() => setShowCreateApartmentModal(false)}
                        onSuccess={() => {
                            handleApartmentCreated();
                            // Re-enable automatic modal after apartment is created
                            window.location.reload();
                        }}
                    />
                </div>
            </div>
        );
    }

    // Full layout with AppLayout component including hamburger menu
    return (
        <AppLayout
            user={user}
            selectedApartment={selectedApartment}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            unreadMessages={unreadMessages}
            onChatToggle={handleChatToggle}
            onLogout={handleLogout}
            isManager={hasPermission('manage')}
            isOwner={hasPermission('owner')}
            onCreateApartment={handleCreateApartment}
            isChatOpen={isChatOpen}
            currentProjectId={currentProjectId}
            apartmentId={apartmentId}
            handleChatToggle={handleChatToggle}
            showCreateApartmentModal={showCreateApartmentModal}
            setShowCreateApartmentModal={setShowCreateApartmentModal}
            handleApartmentCreated={handleApartmentCreated}
        >
            <ViewRenderer
                activeView={activeView}
                selectedApartment={selectedApartment}
                appData={appData}
                dataHandlers={dataHandlers}
                appHandlers={appHandlers}
                settings={settings}
            />
        </AppLayout>
    );
} 