import { useState } from 'react';
import { compilerAiService } from '../services/compilerAiService';

export const useCompilerAi = () => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const explainError = async (code, consoleOutput) => {
    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const result = await compilerAiService.explainError(code, consoleOutput);
      const text = result?.response || result?.explanation || result?.detail || 'No explanation returned.';
      setExplanation(text);
      return text;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 429 && detail) {
        setExplanation(detail);
        return detail;
      }

      const message = detail || err.message || 'AI mentor service error.';
      setError(message);
      setExplanation(message);
      return message;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    explanation,
    isLoading,
    error,
    explainError,
  };
};
