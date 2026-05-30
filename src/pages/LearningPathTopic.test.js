import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LearningPathTopic from './LearningPathTopic';
import { useCurriculum } from '../hooks/useCurriculum';
import { useProgress, useTopicStatus } from '../hooks/useProgress';

// Mock react-router-dom to bypass Jest resolve issues with v7 package exports
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useParams: () => ({ topicId: 'lmr' }),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/lmr' }),
}), { virtual: true });

// Mock IntersectionObserver for testing components that use ScrollTracker
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock subcomponents to avoid rendering dependencies
jest.mock('../components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../components/Footer', () => () => <div data-testid="footer" />);
jest.mock('../components/common/VideoCarousel', () => () => <div data-testid="video-carousel" />);
jest.mock('../components/common/Quiz', () => () => <div data-testid="quiz" />);
jest.mock('../components/common/ExerciseCompiler', () => () => <div data-testid="exercise-compiler" />);
jest.mock('./compiler', () => () => <div data-testid="compiler" />);

// Mock studentService to prevent ESM import issue with axios in Jest
jest.mock('../services/studentService', () => ({
  logProgress: jest.fn(),
  logExercise: jest.fn(),
  logVideo: jest.fn(),
  getTopicStatus: jest.fn(() => Promise.resolve({ videos: {}, quizzes: {}, exercises: {} })),
}));

// Mock hooks
jest.mock('../hooks/useCurriculum');
jest.mock('../hooks/useProgress');

// Mock data representing Cards/Links in the curriculum
const mockCurriculumData = {
  cards: [
    {
      heading: "Fundamentals",
      links: [
        { text: "Intro", url: "/js", pageContent: { description: "Basics" } }
      ]
    },
    {
      heading: "JavaScript Core",
      links: [
        { text: "Closures", url: "/cc", pageContent: { description: "Closures content" } }
      ]
    },
    {
      heading: "Frontend Mastery",
      links: [
        {
          text: "Lifecycle Methods in React",
          url: "/lmr",
          pageContent: {
            description: "Understanding lifecycle",
            title1: "Introduction to React Lifecycle Methods",
            para1: "Lifecycle introduction paragraph",
            code1: "// Example: code1 general lifecycle",
            title3: "React Lifecycle Phases", // No code
            title4: "1. Mounting Phase",
            title41: "Mounting phase paragraph",
            code2: "// Example: code2 mounting phase",
            title5: "2. Updating Phase",
            title51: "Updating phase paragraph",
            code3: "// Example: code3 updating phase",
            title6: "3. Unmounting Phase",
            title61: "Unmounting phase paragraph",
            code4: "// Example: code4 unmounting phase",
            videos: [],
            quizzes: []
          }
        },
        {
          text: "React Basics",
          url: "/rb",
          pageContent: { description: "React Basics content" }
        }
      ]
    }
  ]
};

describe('LearningPathTopic Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock curriculum loading
    useCurriculum.mockReturnValue({
      curriculum: mockCurriculumData,
      loading: false,
      error: null
    });

    // Mock progress hook
    useProgress.mockReturnValue({
      markTheoryRead: jest.fn(),
      computePageProgress: jest.fn(() => ({ percentage: 0, status: 'Not Started' })),
      computeHeadingProgress: jest.fn(() => 25),
      updateLastVisited: jest.fn(),
      submitExerciseResult: jest.fn(),
      exerciseProgress: {}
    });

    // Mock topic status hook
    useTopicStatus.mockReturnValue({
      status: { videos: {}, quizzes: {}, exercises: {} },
      markVideoCompleted: jest.fn(),
      refreshStatus: jest.fn()
    });

    // Mock window.scrollTo to suppress JSDOM virtual console error
    window.scrollTo = jest.fn();
  });

  test('should render content sections and code examples with correct alignment in Group B', () => {
    render(<LearningPathTopic />);

    // Verify main headings render
    expect(screen.getByText('Introduction to React Lifecycle Methods')).toBeInTheDocument();
    expect(screen.getByText('React Lifecycle Phases')).toBeInTheDocument();
    expect(screen.getByText('1. Mounting Phase')).toBeInTheDocument();
    expect(screen.getByText('2. Updating Phase')).toBeInTheDocument();
    expect(screen.getByText('3. Unmounting Phase')).toBeInTheDocument();

    // Verify code block mapping is correct and NOT jumbled
    const sections = screen.getAllByRole('heading', { level: 3 });
    
    // Find section containers
    const introSection = sections.find(el => el.textContent === 'Introduction to React Lifecycle Methods').closest('section');
    expect(introSection.textContent).toContain('code1');
    expect(introSection.textContent).not.toContain('code2');

    // React Lifecycle Phases should NOT have any code container
    const phasesSection = sections.find(el => el.textContent === 'React Lifecycle Phases').closest('section');
    expect(phasesSection.textContent).not.toContain('Example: code');

    // Mounting Phase should have code2
    const mountingSection = sections.find(el => el.textContent === '1. Mounting Phase').closest('section');
    expect(mountingSection.textContent).toContain('code2');
    expect(mountingSection.textContent).not.toContain('code1');
    expect(mountingSection.textContent).not.toContain('code3');

    // Updating Phase should have code3
    const updatingSection = sections.find(el => el.textContent === '2. Updating Phase').closest('section');
    expect(updatingSection.textContent).toContain('code3');

    // Unmounting Phase should have code4
    const unmountingSection = sections.find(el => el.textContent === '3. Unmounting Phase').closest('section');
    expect(unmountingSection.textContent).toContain('code4');
  });

  test('should navigate to correct URL when clicking sidebar link', () => {
    render(<LearningPathTopic />);

    // Locate the "React Basics" sublink item in the sidebar
    const reactBasicsLink = screen.getByText('React Basics');
    expect(reactBasicsLink).toBeInTheDocument();

    // Click on the sublink
    fireEvent.click(reactBasicsLink.closest('.sublink-item'));

    // Should navigate using React Router
    expect(mockNavigate).toHaveBeenCalledWith('/rb');
  });
});
