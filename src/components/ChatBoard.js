import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { SendIcon, DocumentIcon } from './Icons';
import FileUploadFirestore from './FileUploadFirestore';

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

export default function ChatBoard({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);

  // Custom data fetching for messages
  useEffect(() => {
    if (!projectId) {
      setError('לא נמצא מזהה פרויקט');
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects', projectId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageData);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
      setError('שגיאה בטעינת ההודעות. נא לוודא חיבור לאינטרנט');
    });

    return unsubscribe;
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUploaded = (fileInfo) => {
    // No notifications - just add the attachment silently
    setAttachments(prev => [...prev, {
      type: fileInfo.isImage ? 'image' : 'file',
      url: fileInfo.url,
      filename: fileInfo.name,
      size: fileInfo.size,
      contentType: fileInfo.type
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !projectId) return;

    setSending(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'projects', projectId, 'messages'), {
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        sender: auth.currentUser.displayName || auth.currentUser.email || 'אנונימי',
        senderId: auth.currentUser.uid,
        projectId,
        attachments: attachments
      });
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('שגיאה בשליחת ההודעה. נא לוודא חיבור לאינטרנט');
    } finally {
      setSending(false);
    }
  };

  const renderAttachment = (attachment, isCurrentUser) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-1.5 rounded-xl overflow-hidden max-w-xs">
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
        className={`flex items-center gap-2 mt-1.5 p-2 rounded-lg transition-colors max-w-xs ${
          isCurrentUser 
            ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <DocumentIcon className={`w-4 h-4 ${isCurrentUser ? 'text-white' : 'text-gray-600'}`} />
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium truncate ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
            {attachment.filename}
          </div>
          <div className={`text-xs ${isCurrentUser ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
            {(attachment.size / 1024).toFixed(1)}KB
          </div>
        </div>
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-2xl w-2/3"></div>
          <div className="h-8 bg-blue-200 rounded-2xl w-1/2 ml-auto"></div>
          <div className="h-8 bg-gray-200 rounded-2xl w-3/5"></div>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">בחר פרויקט כדי להתחיל לשוחח</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50" dir="rtl" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Clean header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center">
          <div>
            <h2 className="font-medium text-gray-900 text-base">צ'אט צוות</h2>
            <p className="text-xs text-gray-500">
              {messages?.length || 0} הודעות
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mx-4 mt-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Messages Container - Inspired by your example */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <p className="text-gray-500 text-sm">אין הודעות עדיין</p>
            <p className="text-gray-400 text-xs mt-1">התחל שיחה עם הצוות</p>
          </div>
        )}

        {messages?.map((message) => {
          const isCurrentUser = message.senderId === auth.currentUser?.uid;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
                {/* Clean message bubble like your example */}
                <div 
                  className={`inline-block px-3 py-2 rounded-2xl ${
                    isCurrentUser 
                      ? 'bg-blue-500 text-white rounded-br-md shadow-sm' 
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {/* Sender name - only for other users, smaller */}
                  {!isCurrentUser && (
                    <div className="text-xs font-medium text-blue-500 mb-0.5">
                      {message.sender}
                    </div>
                  )}
                  
                  {/* Message content with better typography */}
                  {message.content && (
                    <div className="break-words text-sm leading-relaxed font-normal">
                      {message.content}
                    </div>
                  )}
                  
                  {/* Attachments */}
                  {message.attachments?.map((attachment, index) => (
                    <div key={index}>
                      {renderAttachment(attachment, isCurrentUser)}
                    </div>
                  ))}
                  
                  {/* Time stamp - smaller and more subtle */}
                  <div className={`text-xs mt-0.5 text-left ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.createdAt?.toDate().toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview - only show if exists, smaller */}
      {attachments.length > 0 && (
        <div className="mx-4 mb-3 bg-white rounded-lg border border-gray-100 p-2">
          <div className="text-xs font-medium text-gray-600 mb-2">
            קבצים מצורפים ({attachments.length})
          </div>
          <div className="space-y-1">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {attachment.type === 'image' ? (
                  <div className="relative">
                    <img 
                      src={attachment.url} 
                      alt={attachment.filename}
                      className="h-12 w-12 object-cover rounded"
                    />
                    <button
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded">
                    <DocumentIcon className="w-4 h-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{attachment.filename}</div>
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

      {/* Oval frame like your example */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        {/* Single oval frame with side icons like your drawing */}
        <div className="bg-white rounded-full border-2 border-gray-300 focus-within:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center px-4 py-3">
          
          {/* Left side icon circle - File upload (+) */}
          <div className="flex items-center gap-3">
            <FileUploadFirestore 
              onFileUploaded={handleFileUploaded}
              projectId={projectId}
              disabled={sending}
              minimal={true}
            />
          </div>
          
          {/* Center input field with form wrapper */}
          <form onSubmit={handleSubmit} className="flex-1 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="הקלד הודעה..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-base font-normal outline-none mx-4"
              disabled={sending}
            />
            
            {/* Right side icon circle - Send button (plane) */}
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && attachments.length === 0)}
              className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                sending || (!newMessage.trim() && attachments.length === 0)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
              }`}
            >
              {sending ? (
                <span>⏳</span>
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 