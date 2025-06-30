import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { DocumentIcon, ImageIcon, TrashIcon } from './Icons';

export default function FirestoreFilesViewer({ projectId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'files'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const filesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFiles(filesData.filter(file => file.projectId === projectId));
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('שגיאה בטעינת קבצים:', error);
        setError('שגיאה בטעינת קבצים מפיירבייס');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [projectId]);

  const deleteFile = async (fileId) => {
    try {
      await deleteDoc(doc(db, 'files', fileId));
      console.log('קובץ נמחק בהצלחה');
    } catch (error) {
      console.error('שגיאה במחיקת קובץ:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">טוען קבצים מפיירבייס...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          קבצים בפיירבייס ({files.length})
        </h3>
        <div className="text-xs text-gray-500">
          מ-Firestore Database
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">אין קבצים בפיירבייס עדיין</p>
          <p className="text-xs text-gray-400 mt-1">העלה קבצים בצ'אט כדי לראות אותם כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex items-center space-x-3">
                {file.isImage ? (
                  <img 
                    src={file.dataUrl} 
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <DocumentIcon className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>{file.type}</span>
                    <span>
                      {file.uploadedAt?.toDate?.()?.toLocaleString('he-IL') || 'לא ידוע'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Firestore
                </div>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="מחק קובץ"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 