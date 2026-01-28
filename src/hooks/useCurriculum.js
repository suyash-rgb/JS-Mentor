import { useState, useEffect } from 'react';

export const useCurriculum = () => {
    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Since data.json is in 'public', it's served at the root URL
        fetch('/data.json')
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch curriculum");
                return res.json();
            })
            .then((data) => {
                setCurriculum(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Hook Error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { curriculum, loading, error };
};