import React from 'react';
import { DocumentIcon } from '../Icons';

// File type names for display
const FILE_TYPE_NAMES = {
    'image/jpeg': 'תמונה',
    'image/png': 'תמונה',
    'image/gif': 'תמונה',
    'application/pdf': 'PDF',
    'text/plain': 'טקסט',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word'
};

export function renderAttachment(attachment, isCurrentUser) {
    if (attachment.type === 'image') {
        return (
            <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                <img 
                    src={attachment.url} 
                    alt={attachment.filename}
                    className="w-full h-auto max-h-48 object-cover"
                />
            </div>
        );
    }
    
    return (
        <a 
            href={attachment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 mt-2 p-2 rounded-lg border transition-colors max-w-xs ${
                isCurrentUser 
                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
        >
            <DocumentIcon className="w-4 h-4 text-gray-600" />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-gray-900">
                    {attachment.filename}
                </div>
                <div className="text-xs text-gray-500">
                    {(attachment.size / 1024).toFixed(1)}KB
                </div>
            </div>
        </a>
    );
}

export default function ChatAttachments({ attachments, onRemove }) {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mx-4 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
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
                                    onClick={() => onRemove(index)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
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
                                    onClick={() => onRemove(index)}
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
    );
} 