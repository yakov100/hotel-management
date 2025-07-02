import React from 'react';
import { auth } from '../../firebase/config';

export default function ChatMessage({ message, onDelete, renderAttachment }) {
    const isCurrentUser = message.senderId === auth.currentUser?.uid;

    return (
        <div className={`flex ${isCurrentUser ? 'justify-start' : 'justify-end'} group`} dir="rtl">
            <div className={`max-w-[70%] ${isCurrentUser ? 'mr-auto' : 'ml-auto'} relative`}>
                {/* Delete button */}
                {isCurrentUser && (
                    <button
                        onClick={() => onDelete(message.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        title="מחק הודעה"
                    >
                        ×
                    </button>
                )}

                {/* Message bubble */}
                <div 
                    className={`px-3 py-2 rounded-lg ${
                        isCurrentUser 
                            ? 'bg-blue-500 text-white rounded-bl-none' 
                            : 'bg-gray-100 text-gray-900 rounded-br-none border border-gray-200'
                    }`}
                >
                    {/* Sender name */}
                    {!isCurrentUser && (
                        <div className="text-xs font-medium text-blue-600 mb-1">
                            {message.sender}
                        </div>
                    )}
                    
                    {/* Message content */}
                    {message.content && (
                        <div className="break-words text-sm leading-relaxed" dir="rtl">
                            {message.content}
                        </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments?.map((attachment, index) => (
                        <div key={index}>
                            {renderAttachment(attachment, isCurrentUser)}
                        </div>
                    ))}
                    
                    {/* Time stamp */}
                    <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`} dir="ltr">
                        {message.createdAt ? (
                            typeof message.createdAt.toDate === 'function' 
                                ? message.createdAt.toDate().toLocaleTimeString('he-IL', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : new Date(message.createdAt).toLocaleTimeString('he-IL', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                        ) : ''}
                    </div>
                </div>
            </div>
        </div>
    );
} 