import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { suppressBrowserExtensionErrors, logBrowserExtensionWarning } from './utils/errorUtils';

// הפעלת מנגנון דיכוי שגיאות תוספים
suppressBrowserExtensionErrors();
logBrowserExtensionWarning();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 