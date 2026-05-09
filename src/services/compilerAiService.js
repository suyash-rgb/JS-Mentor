import axios from 'axios';

const EXPLAIN_ERROR_URL = 'http://127.0.0.1:8000/ai/js-mentor/explain-error';

export const compilerAiService = { 
  explainError: async (code, consoleOutput) => {
    const response = await axios.post(EXPLAIN_ERROR_URL, {
      code,
      error_message: consoleOutput,
    });
    return response.data;
  },
};
