import { useState, useEffect } from 'react';

// Singleton cache variables outside the hook to persist across mounts
let globalCurriculumCache = null;
let globalFetchPromise = null;

export const useCurriculum = () => {
    const [curriculum, setCurriculum] = useState(globalCurriculumCache);
    const [loading, setLoading] = useState(!globalCurriculumCache);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. If we already have the cache, do nothing
        if (globalCurriculumCache) {
            return;
        }

        const fetchCurriculum = async () => {
            // 2. If another component is already fetching, wait for its promise
            if (globalFetchPromise) {
                try {
                    const data = await globalFetchPromise;
                    setCurriculum(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
                return;
            }

            // 3. Otherwise, initiate the fetch and store the promise globally
            globalFetchPromise = (async () => {
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
                // REDIRECT: Pointing to your FastAPI server instead of the deleted local file
                const response = await fetch(`${API_BASE_URL}/api/v1/curriculum/`);

                if (!response.ok) {
                    throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                // MOCK DATA: Injecting a quiz into the first topic for testing
                if (data.cards && data.cards[0] && data.cards[0].links[0]) {
                    const firstTopic = data.cards[0].links[0].pageContent;
                    firstTopic.quiz1 = [
                        {
                            question: "What is the correct way to declare a variable in modern JavaScript?",
                            options: ["var myVar = 10", "let myVar = 10", "const myVar = 10", "Both B and C"],
                            correctAnswer: "Both B and C"
                        },
                        {
                            question: "Which data type is NOT primitive in JavaScript?",
                            options: ["String", "Number", "Boolean", "Object"],
                            correctAnswer: "Object"
                        }
                    ];
                }

                globalCurriculumCache = data;
                return data;
            })();

            try {
                const data = await globalFetchPromise;
                setCurriculum(data);
                setError(null);
            } catch (err) {
                console.error("Sync Error:", err);
                globalFetchPromise = null; // reset so next try fetches again
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCurriculum();
    }, []);

    return { curriculum, loading, error };
};