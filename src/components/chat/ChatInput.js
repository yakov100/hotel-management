import React from 'react';
import { SendIcon, DocumentIcon } from '../Icons';
import FileUploadFirestore from '../FileUploadFirestore';

export default function ChatInput({ 
    newMessage, 
    setNewMessage, 
    onSubmit, 
    sending, 
    attachments, 
    setAttachments, 
    onFileUploaded, 
    projectId 
}) {
    return (
        <div className="p-4 bg-gray-50 border-t border-gray-200" dir="rtl">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>📎</span>
                        קבצים מצורפים ({attachments.length})
                    </div>
                    <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                            <div key={index} className="relative">
                                {attachment.type === 'image' ? (
                                    <div className="relative">
                                        <img 
                                            src={attachment.url} 
                                            alt={attachment.filename}
                                            className="h-12 w-12 object-cover rounded border"
                                        />
                                        <button
                                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                            className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                                        <DocumentIcon className="w-4 h-4 text-gray-600" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{attachment.filename}</div>
                                            <div className="text-xs text-gray-500">
                                                {(attachment.size / 1024).toFixed(1)}KB
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                            className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 flex items-center px-3 py-2">
                
                {/* File upload - moved to right side for RTL */}
                <div className="flex items-center ml-3">
                    <FileUploadFirestore 
                        onFileUploaded={onFileUploaded}
                        projectId={projectId}
                        disabled={sending}
                        minimal={true}
                    />
                </div>
                
                {/* Input field */}
                <form onSubmit={onSubmit} className="flex-1 flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="הקלד הודעה..."
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-sm outline-none text-right"
                        disabled={sending}
                        dir="rtl"
                    />
                </form>
                
                {/* Send button - moved to left side for RTL */}
                <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                    className={`w-8 h-8 rounded-md transition-colors flex items-center justify-center mr-3 ${
                        sending || (!newMessage.trim() && attachments.length === 0)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <SendIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
} 