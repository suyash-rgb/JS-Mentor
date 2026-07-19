import axios from 'axios';

let API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


// const BACKEND_PATH = process.env.REACT_APP_BACKEND_URL || '/ai/js-mentor/domain-specialized-assistant';

/**
 * Service to interact with the Groq-based AI Wrapper APIs.
 * Follows the pattern established in Chatbot.js
 */

const BACKEND_URL = `${API_BASE_URL}/ai/js-mentor/domain-specialized-assistant`;




export const domainSpecicalizedAssistantService = {
  // Frontend Fast-Fail Check
  checkIfJavaScriptRelated: async (text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/js-mentor/is-js-related`, {
        text: text
      });
      return response.data?.is_related ?? false;
    } catch (err) {
      console.error("JS Check failed, defaulting to true:", err);
      return true;
    }
  },

  // Call your new FastAPI Backend Wrapper
  askDomainSpecicalizedAssistant: async (inputText) => {
    try {
      console.log("Attempting AI Backend call to:", BACKEND_URL);
      const response = await axios.post(BACKEND_URL, {
        input_text: inputText
      });
      console.log("AI Backend Response:", response.data);
      return response.data.response;
    } catch (err) {
      console.error("AI Backend Call Failed:", err);
      throw err;
    }
  }


};

export const fetchQuizExplanation = async (question, selectedAnswer, correctAnswer, isCorrect) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/js-mentor/quiz-explanation`, {
      question: question,
      selected_answer: selectedAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect
    });
    
    return response.data?.explanation || "I'm sorry, I couldn't generate an explanation at this moment. But keep learning!";
  } catch (err) {
    console.error("Failed to fetch quiz explanation:", err);
    return "I'm sorry, I couldn't generate an explanation at this moment. But keep learning!";
  }
};
