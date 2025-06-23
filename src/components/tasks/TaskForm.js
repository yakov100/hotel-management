import React from 'react';
import PropTypes from 'prop-types';

export default function TaskForm({ task = {}, onSubmit, onCancel, isEditing = false }) {
    // Default values for task
    const defaultTask = {
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
    };

    // Merge default values with provided task
    const currentTask = { ...defaultTask, ...task };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(currentTask);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">כותרת</label>
                <input
                    type="text"
                    name="title"
                    value={currentTask.title}
                    onChange={(e) => onSubmit({ ...currentTask, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">תיאור</label>
                <textarea
                    name="description"
                    value={currentTask.description}
                    onChange={(e) => onSubmit({ ...currentTask, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">סטטוס</label>
                <select
                    name="status"
                    value={currentTask.status}
                    onChange={(e) => onSubmit({ ...currentTask, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="pending">ממתין</option>
                    <option value="in_progress">בביצוע</option>
                    <option value="completed">הושלם</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">עדיפות</label>
                <select
                    name="priority"
                    value={currentTask.priority}
                    onChange={(e) => onSubmit({ ...currentTask, priority: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="low">נמוכה</option>
                    <option value="medium">בינונית</option>
                    <option value="high">גבוהה</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">תאריך יעד</label>
                <input
                    type="date"
                    name="dueDate"
                    value={currentTask.dueDate}
                    onChange={(e) => onSubmit({ ...currentTask, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    ביטול
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {isEditing ? 'עדכן' : 'שמור'}
                </button>
            </div>
        </form>
    );
}

TaskForm.propTypes = {
    task: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.oneOf(['pending', 'in_progress', 'completed']).isRequired,
        priority: PropTypes.oneOf(['low', 'medium', 'high']).isRequired,
        dueDate: PropTypes.string
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isEditing: PropTypes.bool
};

TaskForm.defaultProps = {
    isEditing: false
}; 