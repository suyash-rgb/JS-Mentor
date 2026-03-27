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