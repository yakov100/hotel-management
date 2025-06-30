import React, { useState, useRef } from 'react';
import { storage, auth } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { PaperClipIcon, ImageIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function FileUpload({ onFileUploaded, projectId, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`הקובץ גדול מדי. מקסימום 10MB`);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך');
    }
    return true;
  };

  const uploadFile = async (file) => {
    try {
      validateFile(file);
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      const fileId = uuidv4();
      const extension = file.name.split('.').pop();
      const fileName = `${fileId}.${extension}`;
      const filePath = `projects/${projectId}/files/${fileName}`;
      
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            setError(`שגיאה בהעלאה: ${error.message}`);
            setUploading(false);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              const fileInfo = {
                id: fileId,
                name: file.name,
                url: url,
                path: filePath,
                size: file.size,
                type: file.type,
                isImage: file.type.startsWith('image/'),
                uploadedAt: new Date().toISOString()
              };
              
              setUploading(false);
              setUploadProgress(0);
              onFileUploaded && onFileUploaded(fileInfo);
              resolve(fileInfo);
            } catch (error) {
              setError('שגיאה בקבלת קישור');
              setUploading(false);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setError(error.message);
      setUploading(false);
      throw error;
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(uploadFile);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <div className="flex space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <PaperClipIcon className="w-4 h-4" />
          <span>העלה קובץ</span>
        </button>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">מעלה... {uploadProgress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 