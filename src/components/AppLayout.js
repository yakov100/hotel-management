import React from 'react';
import Sidebar from './Sidebar';
import ApartmentSelector from './ApartmentSelector';
import CreateApartmentModal from './CreateApartmentModal';
import ConnectionStatus from './common/ConnectionStatus';
import ChatBubble from './ChatBubble';

export default function AppLayout({
    user,
    selectedApartment,
    isSidebarOpen,
    setIsSidebarOpen,
    activeView,
    setActiveView,
    unreadMessages,
    onLogout,
    isManager,
    isOwner,
    onCreateApartment,
    children,
    currentProjectId,
    apartmentId,
    showCreateApartmentModal,
    setShowCreateApartmentModal,
    handleApartmentCreated
}) {


    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} w-80 xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl relative z-30`}>
                <Sidebar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    userId={user?.uid}
                    tenant={selectedApartment}
                    onLogout={onLogout}
                    isManager={isManager}
                    isOwner={isOwner}
                />
            </div>

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4" dir="ltr">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-1.5 rounded-lg bg-white/50 hover:bg-white/70 border border-white/30 text-primary-600 hover:text-primary-800 transition-all duration-200 mr-4"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center space-x-4" dir="ltr">
                            {/* Apartment Selector */}
                            <ApartmentSelector onCreateApartment={onCreateApartment} />
                            
                            <ConnectionStatus />
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-auto">
                    <div className="h-full relative">
                        {children}
                    </div>
                </main>
            </div>

            {/* Chat Bubble - Floating */}
            <ChatBubble
                projectId={currentProjectId}
                apartmentId={apartmentId}
                apartmentInfo={selectedApartment}
                unreadMessages={unreadMessages}
            />

            {/* Create Apartment Modal */}
            <CreateApartmentModal
                isOpen={showCreateApartmentModal}
                onClose={() => setShowCreateApartmentModal(false)}
                onSuccess={handleApartmentCreated}
            />
        </div>
    );
} 