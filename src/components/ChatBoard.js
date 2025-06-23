import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { MessageCircleIcon } from './Icons';

export default function ChatBoard({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !projectId) return;

    setSending(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'projects', projectId, 'messages'), {
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        sender: auth.currentUser.displayName || auth.currentUser.email || 'אנונימי',
        senderId: auth.currentUser.uid,
        projectId
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('שגיאה בשליחת ההודעה. נא לוודא חיבור לאינטרנט');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="modern-card p-6 animate-pulse">
        <div className="h-6 bg-primary-200 rounded-lg mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-primary-100 rounded-lg"></div>
          <div className="h-20 bg-primary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="modern-card p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <MessageCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">לא נמצא מזהה פרויקט</p>
          <p className="text-red-400 text-sm mt-1">אנא בחר פרויקט כדי להציג את הצ'אט</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 max-h-[80vh] flex flex-col animate-slide-up" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-xl">
            <MessageCircleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-800">צ'אט מנהלים</h2>
            <p className="text-sm text-primary-600">
              {messages?.length || 0} הודעות
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {(!messages || messages.length === 0) && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <MessageCircleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-primary-600 font-medium">אין הודעות עדיין</p>
            <p className="text-primary-400 text-sm mt-1">התחל שיחה חדשה</p>
          </div>
        )}

        {messages?.map((message) => {
          const isCurrentUser = message.senderId === auth.currentUser?.uid;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div 
                className={`message-bubble max-w-[75%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className={`p-3 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.sender}
                    </span>
                    <p className="break-words">
                      {message.content}
                    </p>
                    <span className={`text-xs ${
                      isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                    } self-end`}>
                      {message.createdAt?.toDate().toLocaleTimeString('he-IL')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="הקלד הודעה..."
            className="modern-input flex-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-6"
          >
            שלח
          </button>
        </div>
      </form>

      {/* Loading State */}
      {sending && (
        <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 animate-fade-in">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-primary-600 text-sm font-medium">שולח הודעה...</span>
        </div>
      )}
    </div>
  );
} 