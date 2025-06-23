import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
    const mockTask = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-03-20'
    };

    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all form fields', () => {
        render(<TaskForm task={mockTask} onSubmit={mockSubmit} onCancel={mockCancel} />);
        
        expect(screen.getByLabelText(/כותרת/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/תיאור/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/סטטוס/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/עדיפות/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/תאריך יעד/i)).toBeInTheDocument();
    });

    test('displays correct initial values', () => {
        render(<TaskForm task={mockTask} onSubmit={mockSubmit} onCancel={mockCancel} />);
        
        expect(screen.getByLabelText(/כותרת/i)).toHaveValue(mockTask.title);
        expect(screen.getByLabelText(/תיאור/i)).toHaveValue(mockTask.description);
        expect(screen.getByLabelText(/סטטוס/i)).toHaveValue(mockTask.status);
        expect(screen.getByLabelText(/עדיפות/i)).toHaveValue(mockTask.priority);
        expect(screen.getByLabelText(/תאריך יעד/i)).toHaveValue(mockTask.dueDate);
    });

    test('calls onSubmit when form is submitted', () => {
        render(<TaskForm task={mockTask} onSubmit={mockSubmit} onCancel={mockCancel} />);
        
        fireEvent.submit(screen.getByRole('form'));
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(mockSubmit).toHaveBeenCalledWith(mockTask);
    });

    test('calls onCancel when cancel button is clicked', () => {
        render(<TaskForm task={mockTask} onSubmit={mockSubmit} onCancel={mockCancel} />);
        
        fireEvent.click(screen.getByText(/ביטול/i));
        expect(mockCancel).toHaveBeenCalledTimes(1);
    });
}); 