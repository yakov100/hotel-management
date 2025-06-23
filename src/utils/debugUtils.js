import React from 'react';

// כלי לאיתור באגים ברכיבי React
export class BugDetector {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.performance = [];
        this.isDebugMode = process.env.NODE_ENV === 'development';
    }

    // לוג שגיאות
    logError(error, component, context = {}) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            error: error.message || error,
            stack: error.stack,
            component,
            context,
            type: 'ERROR'
        };
        
        this.errors.push(errorInfo);
        
        if (this.isDebugMode) {
            console.error('🐛 Bug Detected:', errorInfo);
        }
        
        return errorInfo;
    }

    // לוג אזהרות
    logWarning(message, component, context = {}) {
        const warningInfo = {
            timestamp: new Date().toISOString(),
            message,
            component,
            context,
            type: 'WARNING'
        };
        
        this.warnings.push(warningInfo);
        
        if (this.isDebugMode) {
            console.warn('⚠️ Warning:', warningInfo);
        }
        
        return warningInfo;
    }

    // בדיקת ביצועים
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        const duration = end - start;
        
        const perfInfo = {
            timestamp: new Date().toISOString(),
            name,
            duration: `${duration.toFixed(2)}ms`,
            type: 'PERFORMANCE'
        };
        
        this.performance.push(perfInfo);
        
        if (duration > 100 && this.isDebugMode) {
            console.warn('🐌 Slow Performance:', perfInfo);
        }
        
        return result;
    }

    // בדיקת Props חסרים או לא תקינים
    validateProps(props, requiredProps, componentName) {
        const issues = [];
        
        // בדיקת props חובה
        requiredProps.forEach(prop => {
            if (props[prop] === undefined || props[prop] === null) {
                issues.push(`Missing required prop: ${prop}`);
            }
        });
        
        // בדיקת טיפוסים
        Object.keys(props).forEach(key => {
            const value = props[key];
            if (value === undefined) {
                issues.push(`Prop ${key} is undefined`);
            }
        });
        
        if (issues.length > 0) {
            this.logWarning(
                `Props validation failed in ${componentName}`,
                componentName,
                { issues, props }
            );
        }
        
        return issues;
    }

    // בדיקת State לא תקין
    validateState(state, componentName) {
        const issues = [];
        
        if (state === null || state === undefined) {
            issues.push('State is null or undefined');
        }
        
        // בדיקת arrays ריקים שאמורים להכיל נתונים
        Object.keys(state || {}).forEach(key => {
            const value = state[key];
            if (Array.isArray(value) && value.length === 0 && key.includes('data')) {
                issues.push(`${key} array is empty - might indicate data loading issue`);
            }
        });
        
        if (issues.length > 0) {
            this.logWarning(
                `State validation issues in ${componentName}`,
                componentName,
                { issues, state }
            );
        }
        
        return issues;
    }

    // בדיקת API calls
    validateApiResponse(response, endpoint, expectedFields = []) {
        const issues = [];
        
        if (!response) {
            issues.push('API response is empty');
        }
        
        if (response && typeof response === 'object') {
            expectedFields.forEach(field => {
                if (!(field in response)) {
                    issues.push(`Missing expected field: ${field}`);
                }
            });
        }
        
        if (issues.length > 0) {
            this.logError(
                new Error(`API Response validation failed for ${endpoint}`),
                'API',
                { issues, response, endpoint }
            );
        }
        
        return issues;
    }

    // דו"ח מסכם של כל הבאגים
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                performanceIssues: this.performance.filter(p => parseFloat(p.duration) > 100).length
            },
            errors: this.errors,
            warnings: this.warnings,
            performance: this.performance
        };
        
        if (this.isDebugMode) {
            console.group('🔍 Bug Detection Report');
            console.table(report.summary);
            console.log('Full Report:', report);
            console.groupEnd();
        }
        
        return report;
    }

    // ניקוי הלוגים
    clearLogs() {
        this.errors = [];
        this.warnings = [];
        this.performance = [];
    }

    // בדיקת זיכרון
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
            
            if (memory.used > memory.limit * 0.8) {
                this.logWarning(
                    'High memory usage detected',
                    'Memory',
                    memory
                );
            }
            
            return memory;
        }
        
        return null;
    }
}

// יצירת instance גלובלי
export const bugDetector = new BugDetector();

// Hook לשימוש ברכיבי React
export function useBugDetector(componentName) {
    const logError = (error, context) => bugDetector.logError(error, componentName, context);
    const logWarning = (message, context) => bugDetector.logWarning(message, componentName, context);
    const validateProps = (props, required) => bugDetector.validateProps(props, required, componentName);
    const validateState = (state) => bugDetector.validateState(state, componentName);
    const measurePerf = (name, fn) => bugDetector.measurePerformance(`${componentName}.${name}`, fn);
    
    return {
        logError,
        logWarning,
        validateProps,
        validateState,
        measurePerf,
        generateReport: () => bugDetector.generateReport(),
        checkMemory: () => bugDetector.checkMemoryUsage()
    };
}

// Error Boundary Component
export class BugCatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        bugDetector.logError(error, 'ErrorBoundary', {
            errorInfo,
            componentStack: errorInfo.componentStack
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        🐛 שגיאה בהצגת הרכיב
                    </h2>
                    <p className="text-red-600 mb-4">
                        משהו השתבש. הבאג נרשם למעקב.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        נסה שוב
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4">
                            <summary className="cursor-pointer text-red-700 font-medium">
                                פרטי השגיאה (פיתוח)
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 text-red-800 text-xs overflow-auto">
                                {this.state.error?.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
} 