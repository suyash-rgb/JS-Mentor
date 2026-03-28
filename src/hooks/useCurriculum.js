import { useState, useEffect } from 'react';

export const useCurriculum = () => {
    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurriculum = async () => {
            try {
                // REDIRECT: Pointing to your FastAPI server instead of the deleted local file
                const response = await fetch('http://localhost:8000/trainer/curriculum');
                
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

                setCurriculum(data);
                setError(null);
            } catch (err) {
                console.error("Sync Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCurriculum();
    }, []);

    return { curriculum, loading, error };
};