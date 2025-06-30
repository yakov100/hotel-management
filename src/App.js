import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { setLogLevel, addDoc, setDoc, doc, collection, deleteDoc, getDoc, where } from 'firebase/firestore';

// Components
import Sidebar, { navItems } from './components/Sidebar';
import BookingsView from './views/BookingsView';
import GuestsView from './views/GuestsView';
import TasksView from './views/TasksView';
import InventoryView from './views/InventoryView';
import FinancesView from './views/FinancesView';
import MaintenanceView from './views/MaintenanceView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import ChatBoard from './components/ChatBoard';

import Auth from './components/Auth';
import ConnectionStatus from './components/common/ConnectionStatus';
import {
    CalendarIcon,
    UsersIcon,
    BellIcon,
    PackageIcon,
    DollarSignIcon,
    WrenchIcon,
    BarChartIcon,
    SettingsIcon,
} from './components/Icons';

// Hooks
import { useCollection } from './hooks/useCollection';
import { auth } from './firebase/config';
import { db } from './firebase/config';

// Utils
import { suppressBrowserExtensionErrors, logBrowserExtensionWarning } from './utils/errorUtils';
import { TaskProvider } from './context/TaskContext';

export default function App() {
    const [activeView, setActiveView] = useState('bookings');
    const [user, setUser] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);

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

    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        try {
            setLogLevel('debug');
        } catch (e) {
            console.error("Firebase init error", e);
        }
    }, []);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Load tenant data
                try {
                    const userId = String(currentUser.uid);
                    const tenantDoc = await getDoc(doc(db, 'tenants', userId));
                    if (tenantDoc.exists()) {
                        setTenant({ id: tenantDoc.id, ...tenantDoc.data() });
                    } else {
                        // Create default tenant for new users
                        const defaultTenant = {
                            id: userId,
                            name: currentUser.displayName || currentUser.email || 'משתמש חדש',
                            email: currentUser.email,
                            additionalEmails: currentUser.email ? [currentUser.email] : [],
                            createdAt: new Date(),
                            settings: {
                                hotelName: 'המלון שלי',
                                defaultCheckInTime: '14:00',
                                defaultCheckOutTime: '10:00'
                            }
                        };
                        await setDoc(doc(db, 'tenants', userId), defaultTenant);
                        setTenant(defaultTenant);
                    }
                } catch (error) {
                    console.error("Error loading tenant:", error);
                    setError("שגיאה בטעינת נתוני המשתמש. נא לוודא חיבור אינטרנט תקין.");
                    return;
                }
            } else {
                setUser(null);
                setTenant(null);
            }
            setIsAuthReady(true);
        });
        return unsub;
    }, []);

    const tenantId = useMemo(() => user?.uid ? String(user.uid) : 'default', [user]);
    
    // Collection queries with tenant filter
    const tenantFilter = useMemo(() => [where('tenantId', '==', tenantId)], [tenantId]);
    
    const { documents: bookings = [], error: bookingsError, isLoading: bookingsLoading } = useCollection('bookings', tenantFilter, 'checkIn');
    const { documents: guests = [], error: guestsError, isLoading: guestsLoading } = useCollection('guests', tenantFilter);
    const { documents: tasks = [], error: tasksError, isLoading: tasksLoading } = useCollection('tasks', tenantFilter);
    const { documents: inventory = [], error: inventoryError, isLoading: inventoryLoading } = useCollection('inventory', tenantFilter);
    const { documents: finances = [], error: financesError, isLoading: financesLoading } = useCollection('finances', tenantFilter);
    const { documents: maintenance = [], error: maintenanceError, isLoading: maintenanceLoading } = useCollection('maintenance', tenantFilter);

    const settings = tenant?.settings || null;
    const isFirebaseAvailable = !bookingsError && !guestsError;

    // עדכון הפרויקט הנוכחי כאשר נטען הפרויקט הראשון
    useEffect(() => {
        if (bookings && bookings.length > 0 && !currentProjectId) {
            setCurrentProjectId(bookings[0].id);
        }
    }, [bookings, currentProjectId]);

    const handleSave = useCallback((collectionName) => async (id, data) => {
        if (!db || !tenantId || typeof tenantId !== 'string') return;
        try {
            // Add tenantId to all data
            const dataWithTenant = { ...data, tenantId };
            
            if (id) {
                await setDoc(doc(db, collectionName, id), dataWithTenant, { merge: true });
            } else {
                await addDoc(collection(db, collectionName), dataWithTenant);
            }
        } catch (e) {
            console.error(`Save error to ${collectionName}:`, e);
        }
    }, [tenantId]);

    const handleDelete = useCallback((collectionName) => async (id) => {
        if (!db || !tenantId || typeof tenantId !== 'string') return;
        try {
            await deleteDoc(doc(db, collectionName, id));
        } catch (e) {
            console.error(`Delete error from ${collectionName}:`, e);
        }
    }, [tenantId]);

    const handleSettingsSave = useCallback(async (id, data) => {
        if (!tenantId || typeof tenantId !== 'string') return;
        try {
            await setDoc(doc(db, 'tenants', tenantId), {
                ...tenant,
                settings: data
            }, { merge: true });
            // Update local tenant state
            setTenant(prev => ({ ...prev, settings: data }));
        } catch (e) {
            console.error('Settings save error:', e);
        }
    }, [tenantId, tenant]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleProjectSelect = (projectId) => {
        setCurrentProjectId(projectId);
    };

    // Show authentication screen if user is not logged in
    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="modern-card p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-800 mb-2">מתחבר למערכת...</h3>
                    <p className="text-primary-600">אנא המתן</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Auth onAuthSuccess={() => setIsAuthReady(true)} />;
    }

    const renderActiveView = () => {
        if (!tenant) {
            return (
                <div className="flex flex-col justify-center items-center h-full p-8 animate-fade-in">
                    <div className="modern-card p-8 text-center max-w-md">
                        <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-primary-800 mb-2">טוען פרופיל...</h3>
                        <p className="text-primary-600">מכין את המערכת</p>
                    </div>
                </div>
            );
        }

        switch (activeView) {
            case 'bookings':
                return (
                    <BookingsView
                        bookings={bookings}
                        loading={bookingsLoading}
                        error={bookingsError}
                        onSave={handleSave('bookings')}
                        onDelete={handleDelete('bookings')}
                        settings={settings}
                        currentProjectId={currentProjectId}
                        onProjectSelect={handleProjectSelect}
                    />
                );
            case 'guests':
                return (
                    <GuestsView
                        guests={guests}
                        onSave={handleSave('guests')}
                        onDelete={handleDelete('guests')}
                        settings={settings}
                        bookings={bookings}
                    />
                );
            case 'tasks':
                return (
                    <TasksView
                        tasks={tasks}
                        onSave={handleSave('tasks')}
                        onDelete={handleDelete('tasks')}
                        tenantId={tenantId}
                        tenantInfo={tenant}
                    />
                );
            case 'inventory':
                return (
                    <InventoryView
                        inventory={inventory}
                        onSave={handleSave('inventory')}
                        onDelete={handleDelete('inventory')}
                    />
                );
            case 'finances':
                return (
                    <FinancesView
                        finances={finances}
                        onSave={handleSave('finances')}
                        onDelete={handleDelete('finances')}
                    />
                );
            case 'maintenance':
                return (
                    <MaintenanceView
                        maintenance={maintenance}
                        onSave={handleSave('maintenance')}
                        onDelete={handleDelete('maintenance')}
                    />
                );
            case 'reports':
                return <ReportsView bookings={bookings} finances={finances} />;
            case 'settings':
                return (
                    <SettingsView
                        settings={settings}
                        onSave={handleSettingsSave}
                        tenant={tenant}
                    />
                );
            default:
                return (
                    <div className="flex justify-center items-center h-full">
                        <div className="modern-card p-8 text-center">
                            <p className="text-lg text-primary-700">יש לבחור תצוגה</p>
                        </div>
                    </div>
                );
        }
    };

    const currentNav = navItems.find(i => i.id === activeView);

    return (
        <TaskProvider>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden" dir="rtl">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent-100/50 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success-100/50 to-transparent rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-warning-100/30 to-transparent rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Main Layout */}
                <div className="flex min-h-screen">
                    {/* Overlay for hamburger menu */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                            onClick={() => setIsSidebarOpen(false)}
                        ></div>
                    )}

                    {/* Hamburger Menu Sidebar */}
                    <aside className={`fixed top-0 right-0 h-screen w-80 transform transition-transform duration-300 ease-in-out z-50 
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                        bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl border-l border-white/20 shadow-2xl`}>
                        <Sidebar
                            activeView={activeView}
                            setActiveView={setActiveView}
                            isOpen={isSidebarOpen}
                            setIsOpen={setIsSidebarOpen}
                            userId={user?.uid}
                            tenant={tenant}
                            onLogout={handleLogout}
                            onNewBooking={() => handleSave('bookings')(null, { date: new Date().toISOString().split('T')[0] })}
                            onExportExcel={() => {
                                const data = bookings?.map(booking => ({
                                    ...booking,
                                    date: new Date(booking.date).toLocaleDateString('he-IL')
                                })) || [];
                                console.log('Export to Excel:', data);
                            }}
                            onExportCSV={() => {
                                const data = bookings?.map(booking => ({
                                    ...booking,
                                    date: new Date(booking.date).toLocaleDateString('he-IL')
                                })) || [];
                                console.log('Export to CSV:', data);
                            }}
                        />
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Modern Header */}
                        <header className="relative z-20">
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-md"></div>
                            <div className="relative px-4 md:px-8 py-2 flex justify-between items-center">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-xl bg-white/60 hover:bg-white border border-white/30 text-primary-600 hover:text-primary-800 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                                    aria-label="פתח תפריט צד"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                </button>
                            </div>
                        </header>
                        
                        {/* Offline Status */}
                        {!isFirebaseAvailable && (
                            <div className="bg-warning-50 px-4 py-2 flex items-center gap-1 text-sm text-warning-600 border-b border-warning-100">
                                <span>⚠️</span>
                                <span>מצב אופליין</span>
                            </div>
                        )}
                        
                        {/* Main Content */}
                        <main className="flex-1 overflow-auto p-6 relative">
                            <div className="animate-fade-in">
                                {renderActiveView()}
                            </div>
                        </main>
                    </div>

                    {/* Chat Board - Fixed position */}
                    <div className="w-80 shrink-0 p-6 flex flex-col relative">
                        <div className="sticky top-6">
                            <ChatBoard projectId={currentProjectId} />
                        </div>
                    </div>
                </div>
                
                <ConnectionStatus />
            </div>
        </TaskProvider>
    );
} 