import { useEffect, useState, useRef } from 'react';
import { fetchQuizExplanation } from '../utils/groqService';

/**
 * Custom hook that uses a MutationObserver to listen for quiz result changes in the DOM
 * and triggers an AI-powered explanation via Groq.
 * @param {Object} targetRef - Ref of the element to observe
 * @param {any} trigger - A dependency to re-trigger the effect (e.g. isStarted)
 */
export const useAIFeedback = (targetRef, trigger) => {
    const [explanation, setExplanation] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        if (!targetRef.current) {
            console.log("Observer Target not found yet...");
            return;
        }

        console.log("Attaching MutationObserver to:", targetRef.current.id);

        // Configuration for the observer:
        // We look for changes in attributes (specifically 'data-quiz-result')
        const config = { attributes: true, attributeFilter: ['data-quiz-result'] };

        const callback = async (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-quiz-result') {
                    const resultData = targetRef.current.getAttribute('data-quiz-result');
                    if (!resultData) continue;

                    try {
                        const { question, selected, correct, isCorrect } = JSON.parse(resultData);
                        
                        setIsGenerating(true);
                        setExplanation("Generating AI explanation...");
                        
                        const aiResponse = await fetchQuizExplanation(question, selected, correct, isCorrect);
                        setExplanation(aiResponse);
                    } catch (err) {
                        console.error("MutationObserver Callback Error:", err);
                        setExplanation("Sorry, I encountered an error creating the explanation.");
                    } finally {
                        setIsGenerating(false);
                    }
                }
            }
        };

        // Create and start the observer
        observerRef.current = new MutationObserver(callback);
        observerRef.current.observe(targetRef.current, config);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                console.log("Observer Disconnected");
            }
        };
    }, [targetRef, trigger]);

    return { explanation, isGenerating, setExplanation };
};
