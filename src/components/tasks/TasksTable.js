import React from 'react';
import PropTypes from 'prop-types';

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'text-red-600 bg-red-50 px-2 py-1 rounded-lg';
        case 'medium': return 'text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg';
        case 'low': return 'text-green-600 bg-green-50 px-2 py-1 rounded-lg';
        default: return 'text-gray-600 bg-gray-50 px-2 py-1 rounded-lg';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'bg-gradient-to-l from-green-400 to-emerald-400 text-white shadow-sm';
        case 'in_progress': return 'bg-gradient-to-l from-blue-400 to-blue-600 text-white shadow-sm';
        case 'pending': return 'bg-gradient-to-l from-yellow-400 to-orange-400 text-white shadow-sm';
        default: return 'bg-gray-200 text-gray-800';
    }
};

export default function TasksTable({ tasks, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/20">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-l from-blue-50 to-purple-50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">כותרת</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">סטטוס</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">עדיפות</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">תאריך יעד</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">תזכורת מייל</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">פעולות</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-blue-50/60 cursor-pointer transition-all" onClick={() => onEdit(task)}>
                            <td className="px-6 py-4 font-medium text-primary-800">
                                <div>
                                    <div className="font-semibold">{task.title}</div>
                                    {task.description && (
                                        <div className="text-xs text-primary-600 mt-1 max-w-xs truncate">
                                            {task.description}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex text-xs leading-5 font-bold rounded-full px-3 py-1 ${getStatusColor(task.status)}`}>
                                    {task.status === 'pending' && 'ממתין'}
                                    {task.status === 'in_progress' && 'בביצוע'}
                                    {task.status === 'completed' && 'הושלם'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`font-semibold text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'high' && 'גבוהה'}
                                    {task.priority === 'medium' && 'בינונית'}
                                    {task.priority === 'low' && 'נמוכה'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-primary-700 text-sm">{task.dueDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {task.emailEnabled ? (
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <span className="text-xs">📧</span>
                                        <span className="text-xs font-medium">
                                            {task.emailTime || '09:00'}
                                            {task.emailDaysBefore > 0 && (
                                                <span className="text-blue-500">
                                                    {' '}(-{task.emailDaysBefore})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                <button
                                    onClick={e => { e.stopPropagation(); onDelete(task.id); }}
                                    className="text-red-600 hover:text-white hover:bg-gradient-to-l hover:from-red-400 hover:to-pink-500 px-3 py-1 rounded-lg transition-all font-bold shadow-sm"
                                >
                                    מחק
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

TasksTable.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.oneOf(['pending', 'in_progress', 'completed']).isRequired,
        priority: PropTypes.oneOf(['low', 'medium', 'high']).isRequired,
        dueDate: PropTypes.string
    })).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}; 