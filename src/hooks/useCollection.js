import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCollection = (collectionName, queryConstraints = [], orderByField = null) => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Memoize query constraints to avoid infinite re-renders
    const memoizedConstraints = useMemo(() => queryConstraints, [queryConstraints]);

    useEffect(() => {
        if (!collectionName) {
            setDocuments([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (!navigator.onLine) {
            setError('אין חיבור לאינטרנט. המערכת דורשת חיבור פעיל כדי לעבוד.');
            setIsLoading(false);
            return;
        }

        try {
            const collectionRef = collection(db, collectionName);
            let queryRef = query(collectionRef);

            // Add query constraints if any
            if (memoizedConstraints.length > 0) {
                queryRef = query(collectionRef, ...memoizedConstraints);
            }

            // Add orderBy if specified
            if (orderByField) {
                queryRef = query(queryRef, orderBy(orderByField));
            }

            const unsubscribe = onSnapshot(queryRef, 
                (snapshot) => {
                    let results = [];
                    snapshot.docs.forEach(doc => {
                        results.push({ ...doc.data(), id: doc.id });
                    });
                    setDocuments(results);
                    setIsLoading(false);
                    setError(null);
                },
                (err) => {
                    console.error(`שגיאה בטעינת ${collectionName}:`, err);
                    setError(`שגיאה בטעינת נתונים. נא לוודא חיבור אינטרנט תקין.`);
                    setIsLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error(`שגיאה ביצירת שאילתה עבור ${collectionName}:`, err);
            setError(`שגיאה בהגדרת השאילתה. נא לוודא תקינות הפרמטרים.`);
            setIsLoading(false);
        }
    }, [collectionName, memoizedConstraints, orderByField]);

    return { documents, error, isLoading };
}; 