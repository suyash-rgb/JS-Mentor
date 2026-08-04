import axios from 'axios';

let API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const QUIZ_SECRET_KEY = process.env.REACT_APP_QUIZ_SECRET_KEY || "JSMENTOR_SECURE_QUIZ_KEY_2026";

const encodeQuizPayload = (data) => {
  try {
    const jsonStr = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonStr);
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      xored[i] = bytes[i] ^ QUIZ_SECRET_KEY.charCodeAt(i % QUIZ_SECRET_KEY.length);
    }
    let binary = '';
    for (let i = 0; i < xored.length; i++) {
      binary += String.fromCharCode(xored[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error("Failed to encode quiz payload:", err);
    return null;
  }
};

const decodeQuizPayload = (encodedStr) => {
  try {
    const raw = atob(encodedStr);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i) ^ QUIZ_SECRET_KEY.charCodeAt(i % QUIZ_SECRET_KEY.length);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to decode quiz payload:", err);
    return null;
  }
};

export const prefetchQuizExplanation = async (question, options, correctAnswer) => {
  try {
    const payloadObj = {
      question: question,
      options: options,
      correct_answer: correctAnswer
    };
    const encodedRequest = encodeQuizPayload(payloadObj);
    const response = await axios.post(
      `${API_BASE_URL}/ai/js-mentor/quiz-prefetch`,
      encodedRequest ? { encoded: encodedRequest } : payloadObj
    );

    let data = response.data;
    if (data && data.encoded) {
      const decoded = decodeQuizPayload(data.encoded);
      if (decoded) {
        data = decoded;
      }
    }

    return {
      correct: data?.correct || "Great job! That is correct.",
      incorrect: data?.incorrect || `That is incorrect. The correct answer is ${correctAnswer}. Please review the JavaScript core rules and behavior for this syntax.`
    };
  } catch (err) {
    console.error("Failed to prefetch quiz explanations:", err);
    return {
      correct: "Great job! That is correct.",
      incorrect: `That is incorrect. The correct answer is ${correctAnswer}. Please review the JavaScript core rules and behavior for this syntax.`
    };
  }
};
