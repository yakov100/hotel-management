import React, { useState, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (מוגבל יותר כי נשמר בDB)
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain'
];

// Simple Plus Icon Component
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function FileUploadFirestore({ onFileUploaded, projectId, disabled = false, minimal = false }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`הקובץ גדול מדי. מקסימום 2MB`);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך');
    }
    return true;
  };

  const convertFileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file) => {
    try {
      validateFile(file);
      setUploading(true);
      
      const dataURL = await convertFileToDataURL(file);
      const fileId = uuidv4();
      
      const fileData = {
        id: fileId,
        name: file.name,
        dataUrl: dataURL,
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/'),
        uploadedAt: serverTimestamp(),
        uploadedBy: auth.currentUser?.uid || 'anonymous',
        projectId: projectId
      };

      // שמירה ב-Firestore - בשקט, בלי הודעות
      await addDoc(collection(db, 'files'), fileData);
      
      const fileInfo = {
        ...fileData,
        url: dataURL
      };
      
      setUploading(false);
      onFileUploaded && onFileUploaded(fileInfo);
      
    } catch (error) {
      console.error('שגיאה בשמירת קובץ:', error);
      setUploading(false);
      // No error display in minimal mode - just console log
    }
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    fileArray.forEach(processFile);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Minimal WhatsApp-style button
  if (minimal) {
    return (
      <button
        onClick={openFileDialog}
        disabled={disabled || uploading}
        className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
          disabled || uploading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
        title="צרף קובץ"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />
        {uploading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <PlusIcon className="w-5 h-5" />
        )}
      </button>
    );
  }

  // Original full version for other uses
  return (
    <div className="space-y-2">
      <div
        className={`
          border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer
          border-gray-300 hover:border-gray-400
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-600">מעלה קובץ...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <PlusIcon className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">לחץ לבחירת קובץ</p>
            <p className="text-xs text-gray-500">
              תמונות, PDF - עד 2MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 