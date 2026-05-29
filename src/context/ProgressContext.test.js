import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { ProgressProvider, useProgressContext } from './ProgressContext';
import { logProgress } from '../utils/studentService';
import { useAuth } from '@clerk/clerk-react';

// Mock Clerk auth
jest.mock('@clerk/clerk-react', () => ({
    useAuth: jest.fn(),
}));

// Mock studentService progress logger
jest.mock('../utils/studentService', () => ({
    logProgress: jest.fn(),
    logExercise: jest.fn(),
}));

describe('ProgressContext', () => {
    let mockGetToken;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockGetToken = jest.fn().mockResolvedValue('mock-token');
        useAuth.mockReturnValue({
            getToken: mockGetToken,
        });
    });

    test('should trigger logProgress API call when markTheoryRead is called for the first time', async () => {
        const wrapper = ({ children }) => <ProgressProvider>{children}</ProgressProvider>;
        const { result } = renderHook(() => useProgressContext(), { wrapper });

        // Initially, the page is not in progress
        expect(result.current.theoryProgress['test-topic']).toBeUndefined();

        // Mark it as read
        await act(async () => {
            await result.current.markTheoryRead('test-topic');
        });

        // The state should be updated to true
        expect(result.current.theoryProgress['test-topic']).toBe(true);

        // API should be called with token and status 'COMPLETED'
        expect(logProgress).toHaveBeenCalledWith('test-topic', 'COMPLETED', 120, 'mock-token');
    });

    test('should NOT trigger logProgress API call if already marked as read in local storage/state', async () => {
        // Pre-populate localStorage
        localStorage.setItem('js-mentor-theory-progress', JSON.stringify({ 'test-topic': true }));

        const wrapper = ({ children }) => <ProgressProvider>{children}</ProgressProvider>;
        const { result } = renderHook(() => useProgressContext(), { wrapper });

        // Already marked as read in state
        expect(result.current.theoryProgress['test-topic']).toBe(true);

        // Mark it as read again
        await act(async () => {
            await result.current.markTheoryRead('test-topic');
        });

        // API should NOT be called
        expect(logProgress).not.toHaveBeenCalled();
    });
});
