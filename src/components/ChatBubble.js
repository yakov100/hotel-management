import React, { useState } from 'react';
import ChatBoard from './ChatBoard';

export default function ChatBubble({ projectId, apartmentId, apartmentInfo, unreadMessages = 0 }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" style={{ zIndex: 9999 }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-white rounded-2xl chat-bubble-shadow border border-gray-200 overflow-hidden w-96 h-[32rem] chat-bubble-enter">
                    <ChatBoard
                        projectId={projectId}
                        apartmentId={apartmentId}
                        apartmentInfo={apartmentInfo}
                        onClose={toggleChat}
                    />
                </div>
            )}

            {/* Chat Toggle Button */}
            <button
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative ${
                    isOpen 
                        ? 'bg-gray-600 hover:bg-gray-700' 
                        : 'bg-gray-800 hover:bg-gray-900 hover:scale-105'
                }`}
                title={isOpen ? 'סגור צ\'אט' : 'פתח צ\'אט'}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
                
                {/* Unread Messages Badge */}
                {!isOpen && unreadMessages > 0 && (
                    <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                    </div>
                )}
            </button>
        </div>
    );
}