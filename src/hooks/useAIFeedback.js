import { useEffect, useState } from 'react';
import { prefetchQuizExplanation } from '../services/groqService';

/**
 * Custom hook that prefetches AI explanations for a given quiz question.
 * It eliminates runtime latency by fetching correct/incorrect explanations 
 * when the question is loaded.
 */
export const useAIFeedback = (currentQuestion, isStarted) => {
    const [prefetched, setPrefetched] = useState(null);
    const [explanation, setExplanation] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [userResult, setUserResult] = useState(null); // { isCorrect }

    useEffect(() => {
        if (isStarted && currentQuestion) {
            setPrefetched(null);
            setExplanation("");
            setUserResult(null);
            setIsGenerating(true);

            prefetchQuizExplanation(
                currentQuestion.text || currentQuestion.question,
                currentQuestion.options,
                currentQuestion.correct_answer || currentQuestion.correctAnswer
            )
            .then(data => {
                setPrefetched(data);
            })
            .catch(err => {
                console.error("Failed prefetching:", err);
            })
            .finally(() => {
                setIsGenerating(false);
            });
        }
    }, [currentQuestion, isStarted]);

    useEffect(() => {
        if (userResult !== null) {
            if (prefetched) {
                setExplanation(userResult.isCorrect ? prefetched.correct : prefetched.incorrect);
            } else {
                setExplanation("Loading AI explanation...");
            }
        }
    }, [userResult, prefetched]);

    return { explanation, isGenerating, setUserResult, setExplanation, isLoaded: !!prefetched };
};
