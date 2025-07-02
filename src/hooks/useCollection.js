import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCollection = (collectionName, queryConstraints = [], orderByField = null) => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [indexFallback, setIndexFallback] = useState(false);
    
    // Use refs to prevent unnecessary re-renders
    const unsubscribeRef = useRef(null);
    const isActiveRef = useRef(true);
    
    // Memoize query constraints to avoid infinite re-renders
    const memoizedConstraints = useMemo(() => {
        return Array.isArray(queryConstraints) ? queryConstraints : [];
    }, [queryConstraints]);
    
    // Memoize the constraint string for deeper comparison
    const constraintsKey = useMemo(() => {
        return JSON.stringify(memoizedConstraints.map(constraint => constraint.toString()));
    }, [memoizedConstraints]);
    
    // Cleanup function
    const cleanup = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    }, []);
    
    // Reset states
    const resetStates = useCallback(() => {
        setDocuments([]);
        setError(null);
        setIsLoading(true);
        setIndexFallback(false);
    }, []);

    useEffect(() => {
        // Clean up previous subscription
        cleanup();
        isActiveRef.current = true;
        
        if (!collectionName) {
            resetStates();
            setIsLoading(false);
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

            // Add orderBy if specified and not in fallback mode
            if (orderByField && !indexFallback) {
                try {
                    queryRef = query(queryRef, orderBy(orderByField));
                } catch (orderError) {
                    console.warn(`❌ OrderBy failed for ${orderByField}, continuing without order`);
                }
            }

            unsubscribeRef.current = onSnapshot(queryRef, 
                (snapshot) => {
                    if (!isActiveRef.current) return; // Prevent state updates if component unmounted
                    
                    const results = [];
                    snapshot.docs.forEach(doc => {
                        results.push({ ...doc.data(), id: doc.id });
                    });
                    setDocuments(results);
                    setIsLoading(false);
                    setError(null);
                },
                (err) => {
                    if (!isActiveRef.current) return; // Prevent state updates if component unmounted
                    
                    console.error(`שגיאה בטעינת ${collectionName}:`, err);
                    
                    // Check if this is an index error and we're using orderBy
                    if (err.code === 'failed-precondition' && 
                        err.message.includes('index') && 
                        orderByField && 
                        !indexFallback) {
                        
                        console.warn(`🔄 Index not ready for ${collectionName} with orderBy ${orderByField}, falling back to no orderBy`);
                        
                        // Use setTimeout to prevent infinite re-renders
                        setTimeout(() => {
                            if (isActiveRef.current) {
                                setIndexFallback(true);
                            }
                        }, 100);
                        return;
                    }
                    
                    setError(`שגיאה בטעינת נתונים: ${err.message}`);
                    setIsLoading(false);
                }
            );
        } catch (err) {
            console.error(`שגיאה ביצירת שאילתה עבור ${collectionName}:`, err);
            setError(`שגיאה בהגדרת השאילתה: ${err.message}`);
            setIsLoading(false);
        }
        
        // Cleanup function
        return () => {
            isActiveRef.current = false;
            cleanup();
        };
    }, [collectionName, constraintsKey, orderByField, indexFallback, cleanup, resetStates]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isActiveRef.current = false;
            cleanup();
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return { 
        documents, 
        error, 
        isLoading,
        indexFallback, // Return this so components can handle sorting themselves
        cleanup // Export cleanup function for manual cleanup if needed
    };
}; 