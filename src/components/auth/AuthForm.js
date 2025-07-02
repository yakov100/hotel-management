import React from 'react';

export default function AuthForm({
    username,
    setUsername,
    password,
    setPassword,
    isRegister,
    setIsRegister,
    loading,
    error,
    onSubmit,
    onSwitchToGoogle
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl text-white">🏨</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {isRegister ? 'הרשמה' : 'התחברות'}
                    </h1>
                    <p className="text-gray-600">
                        {isRegister ? 'צור חשבון חדש' : 'התחבר לחשבון שלך'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            שם משתמש
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="הכנס שם משתמש"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            3-20 תווים, אותיות באנגלית, מספרים, מקף ותחתון בלבד
                        </p>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            סיסמה
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="הכנס סיסמה"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            לפחות 6 תווים
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                                {isRegister ? 'מתרשם...' : 'מתחבר...'}
                            </div>
                        ) : (
                            isRegister ? 'הרשמה' : 'התחברות'
                        )}
                    </button>
                </form>

                <div className="mt-6 space-y-3 text-center">
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium block w-full"
                        disabled={loading}
                    >
                        {isRegister ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הירשם'}
                    </button>
                    
                    {onSwitchToGoogle && (
                        <button
                            type="button"
                            onClick={onSwitchToGoogle}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                            disabled={loading}
                        >
                            חזור להתחברות עם Google
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 