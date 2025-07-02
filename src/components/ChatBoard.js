import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, getDocs, doc } from 'firebase/firestore';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import { renderAttachment } from './chat/ChatAttachments';

export default function ChatBoard({ projectId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);

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

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUploaded = (fileInfo) => {
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

  const handleNewChat = async () => {
    if (!projectId || isClearing) return;
    
    const confirmed = window.confirm('Are you sure you want to delete all messages and start a new chat?');
    if (!confirmed) return;

    setIsClearing(true);
    setError(null);
    
    try {
      const q = query(collection(db, 'projects', projectId, 'messages'));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(docRef => deleteDoc(docRef.ref));
      await Promise.all(deletePromises);
      
      setMessages([]);
      setNewMessage('');
      setAttachments([]);
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('שגיאה במחיקת ההודעות');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!projectId || !messageId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('שגיאה במחיקת ההודעה');
    }
  };

  const handleCloseChat = () => {
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white p-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
          <div className="h-10 bg-gray-100 rounded-lg w-1/2 ml-auto"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-3/5"></div>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-gray-600">בחר פרויקט כדי להתחיל לשוחח</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden" dir="rtl">
      {/* Clean header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">💬</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-base">צ'אט צוות</h2>
                <p className="text-xs text-gray-500">
                  {messages?.length || 0} הודעות
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Scroll to Top Button */}
              {messages.length > 5 && (
                <button
                  onClick={scrollToTop}
                  className="w-8 h-8 rounded-md bg-white hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center text-sm"
                  title="גלול להתחלה"
                >
                  ⬆️
                </button>
              )}

              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                disabled={isClearing || messages.length === 0}
                className="w-8 h-8 rounded-md bg-white hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center"
                title="צ'אט חדש"
              >
                {isClearing ? '🔄' : '+'}
              </button>
              
              {/* Close Chat Button */}
              {onClose && (
                <button
                  onClick={handleCloseChat}
                  className="w-8 h-8 rounded-md bg-white hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center"
                  title="סגור צ'אט"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-scrollbar" style={{ scrollBehavior: 'smooth' }}>
        <div ref={messagesStartRef} />
        
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <p className="text-gray-600 text-base font-medium mb-1">
              אין הודעות עדיין
            </p>
            <p className="text-gray-400 text-sm">
              התחל שיחה עם הצוות
            </p>
          </div>
        )}

        {messages?.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onDelete={handleDeleteMessage}
            renderAttachment={renderAttachment}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSubmit={handleSubmit}
        sending={sending}
        attachments={attachments}
        setAttachments={setAttachments}
        onFileUploaded={handleFileUploaded}
        projectId={projectId}
      />
    </div>
  );
} 