import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChevronTracker from './ChevronTracker';
import '@testing-library/jest-dom';

describe('ChevronTracker Component', () => {
  const mockExercises = [
    { id: 'ex1', title: 'Exercise 1' },
    { id: 'ex2', title: 'Exercise 2' },
    { id: 'ex3', title: 'Exercise 3' },
  ];

  test('should return null if exercises is undefined or length <= 1', () => {
    const { container: containerEmpty } = render(
      <ChevronTracker 
        exercises={[]} 
        activeExerciseIndex={0} 
        setActiveExerciseIndex={jest.fn()} 
        isExerciseSolved={jest.fn()} 
      />
    );
    expect(containerEmpty.firstChild).toBeNull();

    const { container: containerSingle } = render(
      <ChevronTracker 
        exercises={[{ id: 'ex1', title: 'Exercise 1' }]} 
        activeExerciseIndex={0} 
        setActiveExerciseIndex={jest.fn()} 
        isExerciseSolved={jest.fn()} 
      />
    );
    expect(containerSingle.firstChild).toBeNull();
  });

  test('should render correct number of chevron buttons if exercises length > 1', () => {
    render(
      <ChevronTracker 
        exercises={mockExercises} 
        activeExerciseIndex={0} 
        setActiveExerciseIndex={jest.fn()} 
        isExerciseSolved={jest.fn(() => false)} 
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('should call setActiveExerciseIndex with correct index when a chevron tab is clicked', () => {
    const mockSetActiveExerciseIndex = jest.fn();
    render(
      <ChevronTracker 
        exercises={mockExercises} 
        activeExerciseIndex={0} 
        setActiveExerciseIndex={mockSetActiveExerciseIndex} 
        isExerciseSolved={jest.fn(() => false)} 
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Click second chevron
    expect(mockSetActiveExerciseIndex).toHaveBeenCalledWith(1);

    fireEvent.click(buttons[2]); // Click third chevron
    expect(mockSetActiveExerciseIndex).toHaveBeenCalledWith(2);
  });

  test('should assign correct CSS classes based on active and completed status', () => {
    // Mock setup:
    // ex1: active, not solved (index 0)
    // ex2: not active, solved (index 1)
    // ex3: not active, not solved (index 2)
    const isSolvedMock = jest.fn((id) => {
      if (id === 'ex2') return true;
      return false;
    });

    const { rerender } = render(
      <ChevronTracker 
        exercises={mockExercises} 
        activeExerciseIndex={0} 
        setActiveExerciseIndex={jest.fn()} 
        isExerciseSolved={isSolvedMock} 
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('chevron-tab', 'active');
    expect(buttons[0]).not.toHaveClass('completed');
    
    expect(buttons[1]).toHaveClass('chevron-tab', 'completed');
    expect(buttons[1]).not.toHaveClass('active');
    
    expect(buttons[2]).toHaveClass('chevron-tab', 'pending');
    expect(buttons[2]).not.toHaveClass('active', 'completed');

    // Rerender with active and completed on ex2
    // ex2: active, solved (index 1)
    rerender(
      <ChevronTracker 
        exercises={mockExercises} 
        activeExerciseIndex={1} 
        setActiveExerciseIndex={jest.fn()} 
        isExerciseSolved={isSolvedMock} 
      />
    );

    const updatedButtons = screen.getAllByRole('button');
    expect(updatedButtons[1]).toHaveClass('chevron-tab', 'active', 'completed');
  });
});
