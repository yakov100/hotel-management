import React, { useState } from 'react';
import FileUploadLocal from './FileUploadLocal';

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUploaded = (fileInfo) => {
    setUploadedFiles(prev => [...prev, fileInfo]);
    console.log('קובץ הועלה:', fileInfo);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">בדיקת העלאת קבצים</h1>
        <p className="text-gray-600">בדוק שהעלאת קבצים עובדת כראוי</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">העלה קבצים</h2>
        <FileUploadLocal onFileUploaded={handleFileUploaded} />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            קבצים שהועלו ({uploadedFiles.length})
          </h2>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {file.isImage ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-medium">
                        {file.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                >
                  הסר
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 