import React from 'react';

export function ApartmentLoadingState() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '16px' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                textAlign: 'center', 
                maxWidth: '384px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                    borderRadius: '16px', 
                    margin: '0 auto 16px auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '4px solid white', 
                        borderTop: '4px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                    }}></div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>טוען דירות...</h3>
                <p style={{ color: '#3730a3' }}>אנא המתן</p>
            </div>
        </div>
    );
}

export function NoApartmentsState({ onCreateApartment }) {
    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '16px' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                textAlign: 'center', 
                maxWidth: '384px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                    borderRadius: '16px', 
                    margin: '0 auto 16px auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-2a2 2 0 012-2h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v8.1" />
                    </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>ברוכים הבאים!</h3>
                <p style={{ color: '#3730a3', marginBottom: '24px' }}>צרו את הדירה הראשונה שלכם כדי להתחיל</p>
                <button
                    onClick={onCreateApartment}
                    style={{ 
                        width: '100%',
                        padding: '12px 24px',
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        marginBottom: '16px',
                        minHeight: '48px',
                        cursor: 'pointer'
                    }}
                >
                    צור דירה חדשה
                </button>
            </div>
        </div>
    );
}

export function NoApartmentSelectedState() {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%', 
            padding: '32px' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                textAlign: 'center', 
                maxWidth: '384px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>בחר דירה</h3>
                <p style={{ color: '#3730a3' }}>יש לבחור דירה כדי להמשיך</p>
            </div>
        </div>
    );
}

export function NoViewSelectedState() {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                textAlign: 'center',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ fontSize: '18px', color: '#374151' }}>יש לבחור תצוגה</p>
            </div>
        </div>
    );
} 