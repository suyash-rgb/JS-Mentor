import axios from 'axios';

const API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const API_URL = process.env.REACT_APP_GROQ_API_URL;
const MODEL = process.env.REACT_APP_GROQ_MODEL;
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
      const response = await axios.post(API_URL, {
        model: MODEL,
        input: `Determine if the following question is related to JavaScript programming (including frameworks like React, Node.js, TypeScript, etc.). Reply with only "YES" or "NO".\n\nQuestion: ${text}`,
      }, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });


      const result = response.data?.output?.find(item => item.type === "message")?.content?.[0]?.text;
      return result?.trim().toUpperCase().includes("YES") ?? false;
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
    if (!API_KEY || !API_URL) {
      throw new Error("API Configuration missing (Key or URL)");
    }

    const prompt = isCorrect
      ? `The student answered a multiple choice question correctly. 
               Question: "${question}"
               Answer: "${selectedAnswer}"
               Write a short line of encouragement for the student, followed by a brief but insightful explanation of why this answer is correct. 
               Keep the response concise and friendly.`

      : `The student answered a multiple choice question incorrectly. 
               Question: "${question}"
               Student's Answer: "${selectedAnswer}"
               Correct Answer: "${correctAnswer}"
               Start by saying "That is incorrect, the correct answer is ${correctAnswer} because..." and then provide a clear, helpful explanation of the concept. 
               Keep it educational and encouraging.`;

    const response = await axios.post(API_URL, {
      model: MODEL,
      input: prompt,
    }, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    let generatedText = "I'm sorry, I couldn't generate an explanation at this moment. But keep learning!";

    // Parsing logic from Chatbot.js
    if (response.data?.output && Array.isArray(response.data.output)) {
      const messageObj = response.data.output.find(item => item.type === "message");
      if (messageObj?.content?.[0]?.text) {
        generatedText = messageObj.content[0].text;
      }
    }

    return generatedText;
  } catch (error) {
    console.error("Groq Service Error:", error);
    return "Note: AI Explanation is currently unavailable. Please review the topic content for more details.";
  }
};
