import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const TaskContext = createContext();

const initialState = {
    tasks: [],
    loading: false,
    error: null
};

function taskReducer(state, action) {
    switch (action.type) {
        case 'SET_TASKS':
            return {
                ...state,
                tasks: action.payload,
                loading: false
            };
        case 'ADD_TASK':
            return {
                ...state,
                tasks: [...state.tasks, action.payload]
            };
        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? action.payload : task
                )
            };
        case 'DELETE_TASK':
            return {
                ...state,
                tasks: state.tasks.filter(task => task.id !== action.payload)
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
}

export function TaskProvider({ children }) {
    const [state, dispatch] = useReducer(taskReducer, initialState);

    const value = {
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        setTasks: (tasks) => dispatch({ type: 'SET_TASKS', payload: tasks }),
        addTask: (task) => dispatch({ type: 'ADD_TASK', payload: task }),
        updateTask: (task) => dispatch({ type: 'UPDATE_TASK', payload: task }),
        deleteTask: (id) => dispatch({ type: 'DELETE_TASK', payload: id }),
        setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
        setError: (error) => dispatch({ type: 'SET_ERROR', payload: error })
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}

TaskProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useTaskContext() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
} 