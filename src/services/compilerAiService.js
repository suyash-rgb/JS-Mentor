import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const EXPLAIN_ERROR_URL = `${API_BASE_URL}/ai/js-mentor/explain-error`;


export const compilerAiService = {
  explainError: async (code, consoleOutput) => {
    const response = await axios.post(EXPLAIN_ERROR_URL, {
      code,
      error_message: consoleOutput,
    });
    return response.data;
  },
};
