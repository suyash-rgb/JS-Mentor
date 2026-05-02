import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAIFeedback } from '../../hooks/useAIFeedback';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Quiz.css';

import { logQuiz } from '../../utils/analytics';

/**
 * Enhanced Quiz Component
 * - Collapsed by default.
 * - Sequential: One question at a time.
 * - AI-Blocking: Next question only enabled after AI explanation arrives.
 */
const Quiz = ({ questions, topicId = 'general' }) => {
    const { getToken } = useAuth();
    const [isStarted, setIsStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [score, setScore] = useState(0);
    
    // Using the AI feedback hook with MutationObserver
    const feedbackTargetRef = useRef(null);
    const { explanation, isGenerating, setExplanation } = useAIFeedback(feedbackTargetRef, isStarted);

    const currentQuestion = questions[currentIndex];

    const handleOptionSelect = (option) => {
        if (selectedAnswer !== null) return; // Prevent multiple clicks

        const correct = option === currentQuestion.correctAnswer;
        setSelectedAnswer(option);
        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        }

        // Trigger MutationObserver for AI Explanation
        if (feedbackTargetRef.current) {
            const resultData = JSON.stringify({
                question: currentQuestion.question,
                selected: option,
                correct: currentQuestion.correctAnswer,
                isCorrect: correct
            });
            feedbackTargetRef.current.setAttribute('data-quiz-result', resultData);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Reset question-specific state
            setSelectedAnswer(null);
            setIsCorrect(null);
            setExplanation("");
            if (feedbackTargetRef.current) {
                feedbackTargetRef.current.removeAttribute('data-quiz-result');
            }
        } else {
            setIsCompleted(true);
            getToken().then(token => {
                logQuiz(topicId, score, questions.length, token);
            });
        }
    };

    const resetQuiz = () => {
        setIsStarted(false);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsCompleted(false);
        setScore(0);
        setExplanation("");
        if (feedbackTargetRef.current) {
            feedbackTargetRef.current.removeAttribute('data-quiz-result');
        }
    };

    if (!questions || questions.length === 0) return null;

    return (
        <>
            {/* Hidden element for MutationObserver mapping - Always present */}
            <div ref={feedbackTargetRef} id="quiz-feedback-trigger" style={{ display: 'none' }}></div>

            {!isStarted ? (
                <div className="quiz-cta-container">
                    <div className="quiz-cta-content text-center py-4 px-3 rounded shadow-sm">
                        <div className="icon-wrapper mb-3">
                            <i className="fas fa-brain fa-3x text-primary"></i>
                        </div>
                        <h4>Topic Summary Quiz</h4>
                        <p className="text-muted">Test your knowledge of the concepts covered in this topic ({questions.length} questions).</p>
                        <button className="start-quiz-btn" onClick={() => setIsStarted(true)}>
                            Start Knowledge Check <i className="fas fa-play ml-2"></i>
                        </button>
                    </div>
                </div>
            ) : isCompleted ? (
                <div className="quiz-results-summary text-center py-5 rounded shadow-sm">
                    <i className="fas fa-trophy fa-4x mb-3 text-warning"></i>
                    <h2>Quiz Completed!</h2>
                    <p className="mb-4">You've finished the knowledge check for this section. You scored {score} out of {questions.length}.</p>
                    <div className="summary-actions">
                        <button className="btn btn-outline-primary mr-3" onClick={resetQuiz}>Restart Quiz</button>
                        <button className="btn btn-primary" onClick={() => window.scrollTo(0, 0)}>Return to Top</button>
                    </div>
                </div>
            ) : (
                <div className="quiz-container main-quiz-flow mb-5">
                    {/* Quiz body contents */}
                    <div className="quiz-header mb-4 d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Knowledge Check</h3>
                        <span className="question-counter">Question {currentIndex + 1} of {questions.length}</span>
                    </div>

                    <div className="progress-bar-minimal mb-4">
                        <div className="progress-active" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>


            <div className="quiz-question-card active-question-card mb-4 mt-2">
                <p className="quiz-question font-weight-bold mb-4">{currentQuestion.question}</p>
                
                <div className="quiz-options">
                    {currentQuestion.options.map((option, idx) => {
                        const isThisSelected = selectedAnswer === option;
                        const isCorrectOption = option === currentQuestion.correctAnswer;
                        const hasSelected = selectedAnswer !== null;

                        let styleClass = "quiz-option-btn";
                        if (isThisSelected) {
                            styleClass += isCorrect ? " selected-correct" : " selected-incorrect";
                        } else if (hasSelected && isCorrectOption) {
                            styleClass += " highlight-correct";
                        }

                        return (
                            <button 
                                key={idx} 
                                className={styleClass}
                                onClick={() => handleOptionSelect(option)}
                                disabled={hasSelected}
                            >
                                <span className="option-indicator-circle">
                                    {isThisSelected && isCorrect && <i className="fas fa-check-circle"></i>}
                                    {isThisSelected && !isCorrect && <i className="fas fa-times-circle"></i>}
                                    {!hasSelected && <span className="letter-idx">{String.fromCharCode(65 + idx)}</span>}
                                    {hasSelected && !isThisSelected && isCorrectOption && <i className="fas fa-check"></i>}
                                </span>
                                <span className="option-text">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* AI Feedback - only shown when an answer is selected */}
            {(selectedAnswer !== null || isGenerating) && (
                <div className={`ai-feedback-box mt-3 mb-4 rounded ${isGenerating ? 'generating' : 'ready'}`}>
                    <div className="feedback-ribbon px-3 py-2 d-flex justify-content-between align-items-center">
                        <span className="font-weight-bold">
                            <i className={`fas fa-${isGenerating ? 'spinner fa-spin' : 'robot'} mr-2`}></i>
                            {isGenerating ? "Consulting AI Expert..." : "Expert Feedback"}
                        </span>
                    </div>
                    <div className="feedback-body p-3">
                        {isGenerating ? (
                            <div className="skeleton-feedback">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line short"></div>
                            </div>
                        ) : (
                            <div className="feedback-markdown">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {explanation}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation Button - Only active after AI explanation is delivered */}
            <div className="quiz-navigation mt-4 text-right">
                <button 
                    className={`btn-next-question ${(!explanation || isGenerating) ? 'btn-disabled' : 'btn-active'}`}
                    onClick={handleNext}
                    disabled={!explanation || isGenerating}
                >
                    {currentIndex < questions.length - 1 ? "Next Question" : "See Summary"}
                    <i className="fas fa-arrow-right ml-2 text-white"></i>
                </button>
                {(!explanation && selectedAnswer !== null) && <span className="btn-hint ml-3 text-muted">Waiting for AI explanation...</span>}
            </div>
                </div>
            )}
        </>
    );
};

export default Quiz;
