import React, { useState, useRef } from 'react';
import { PaperClipIcon, ImageIcon, XIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function FileUploadLocal({ onFileUploaded, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`הקובץ גדול מדי. מקסימום 5MB`);
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
      setError(null);
      setUploading(true);
      
      // המתן לסימולציה של העלאה
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataURL = await convertFileToDataURL(file);
      
      const fileInfo = {
        id: uuidv4(),
        name: file.name,
        url: dataURL, // נשתמש ב-data URL במקום URL של Firebase
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/'),
        uploadedAt: new Date().toISOString(),
        isLocal: true // נסמן שזה קובץ מקומי
      };
      
      setUploading(false);
      onFileUploaded && onFileUploaded(fileInfo);
      
    } catch (error) {
      setError(error.message);
      setUploading(false);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!disabled && e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      {/* אזור גרירה ושחרור */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
            <p className="text-sm text-gray-600">מעבד קובץ...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center space-x-2">
              <PaperClipIcon className="w-6 h-6 text-gray-400" />
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">גרור קבצים או לחץ לבחירה</p>
            <p className="text-xs text-gray-500">תמונות, PDF, Word - עד 5MB</p>
          </div>
        )}
      </div>

      {/* כפתורי פעולה */}
      <div className="flex space-x-2">
        <button
          onClick={openFileDialog}
          disabled={disabled || uploading}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
        >
          <PaperClipIcon className="w-4 h-4" />
          <span>בחר קובץ</span>
        </button>
      </div>

      {/* הצגת שגיאות */}
      {error && (
        <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-600">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
} 