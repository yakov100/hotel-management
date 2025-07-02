import React from 'react';
import {
    CalendarIcon,
    UsersIcon,
    BellIcon,
    PackageIcon,
    DollarSignIcon,
    WrenchIcon,
    BarChartIcon,
    SettingsIcon,
} from './Icons';

export const navItems = [
    { id: 'bookings', label: 'ניהול הזמנות', icon: <CalendarIcon />, color: 'text-accent-400' },
    { id: 'guests', label: 'ניהול אורחים', icon: <UsersIcon />, color: 'text-success-400' },
    { id: 'tasks', label: 'תזכורות ומשימות', icon: <BellIcon />, color: 'text-warning-400' },
    { id: 'inventory', label: 'ניהול מלאי', icon: <PackageIcon />, color: 'text-purple-400' },
    { id: 'finances', label: 'הכנסות והוצאות', icon: <DollarSignIcon />, color: 'text-emerald-400' },
    { id: 'maintenance', label: 'ניקיון ותחזוקה', icon: <WrenchIcon />, color: 'text-orange-400' },
    { id: 'reports', label: 'דוחות', icon: <BarChartIcon />, color: 'text-pink-400' },
    { id: 'users', label: 'ניהול משתמשים', icon: <UsersIcon />, color: 'text-blue-400', requiresManager: true },
    { id: 'settings', label: 'הגדרות', icon: <SettingsIcon />, color: 'text-slate-400' },
];

export default function Sidebar({ activeView, setActiveView, isOpen, setIsOpen, userId, tenant, onLogout, onNewBooking, onExportExcel, onExportCSV, isManager, isOwner }) {
    return (
        <div className="h-full flex flex-col overflow-hidden" dir="rtl">
            {/* Header - Fixed */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {tenant?.propertyName || 'דירת נופש'}
                    </h1>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl bg-white/50 hover:bg-white/70 border border-white/30 text-primary-600 hover:text-primary-800 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* User Info */}
                <div className="bg-gradient-primary rounded-xl p-4 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{tenant?.name || 'משתמש'}</p>
                            <p className="text-white/70 text-xs truncate">{tenant?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        יציאה
                    </button>
                </div>
            </div>
            
            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {/* Booking Actions */}
                {activeView === 'bookings' && false && (
                    <div className="mb-6 space-y-2 animate-fade-in">
                        <button
                            onClick={onNewBooking}
                            className="w-full p-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>+ הזמנה חדשה</span>
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={onExportExcel}
                                className="flex-1 p-2 bg-success-100 hover:bg-success-200 text-success-700 rounded-xl font-medium text-sm transition-colors"
                            >
                                ייצוא Excel
                            </button>
                            <button
                                onClick={onExportCSV}
                                className="flex-1 p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-xl font-medium text-sm transition-colors"
                            >
                                ייצוא CSV
                            </button>
                        </div>
                    </div>
                )}

                {navItems.filter(item => {
                    // Filter out items that require manager/owner permissions
                    if (item.requiresManager && !isManager && !isOwner) {
                        return false;
                    }
                    return true;
                }).map((item, index) => (
                    <div
                        key={item.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setActiveView(item.id);
                                setIsOpen(false);
                            }}
                            className={`
                                group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl 
                                transition-all duration-300 ease-out
                                border border-transparent
                                ${activeView === item.id
                                    ? `bg-gradient-primary text-white shadow-lg shadow-accent-500/25 
                                       border-white/20 transform scale-[1.02]`
                                    : `text-primary-700 hover:bg-white/60 hover:backdrop-blur-sm 
                                       hover:border-white/30 hover:shadow-md hover:transform hover:scale-[1.01]
                                       hover:text-primary-800`
                                }
                            `}
                        >
                            {/* Background glow effect for active item */}
                            {activeView === item.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-400/20 to-purple-400/20 rounded-2xl blur-sm opacity-75" />
                            )}
                            
                            {/* Icon container */}
                            <div className={`
                                relative flex-shrink-0 p-2 rounded-xl transition-all duration-300
                                ${activeView === item.id 
                                    ? 'bg-white/20 text-white' 
                                    : `bg-white/50 ${item.color} group-hover:bg-white/70 group-hover:scale-110`
                                }
                            `}>
                                <div className="w-5 h-5">
                                    {item.icon}
                                </div>
                            </div>
                            
                            {/* Label */}
                            <span className="relative font-medium text-sm">
                                {item.label}
                            </span>
                            
                            {/* Active indicator */}
                            {activeView === item.id && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-glow" />
                            )}
                            
                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                        </button>
                    </div>
                ))}
            </nav>
            
            {/* Footer - Fixed */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-white/20">
                <div className="text-center">
                    <p className="text-xs text-primary-500 font-medium">
                        © 2024 מערכת ניהול דירות נופש
                    </p>
                    <div className="mt-2 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse-soft"></div>
                        <div className="w-2 h-2 bg-warning-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
} 