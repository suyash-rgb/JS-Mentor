import { useState } from "react";
import { domainSpecicalizedAssistantService } from "../utils/groqService";

export const useDomainSpecializedAIAssistant = () => {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const askAi = async (inputText) => {
    setIsLoading(true);
    setError(null);
    try {
      const isRelated =
        await domainSpecicalizedAssistantService.checkIfJavaScriptRelated(
          inputText,
        );

      if (!isRelated) {
        setResponse(
          "I can only help you with your doubts regarding JavaScript! 🚀\n\n" +
            "You can ask me questions about:\n\n" +
            "- JavaScript fundamentals (variables, loops, functions, etc.)\n" +
            "- ES6+ features and modern JavaScript\n" +
            "- React, Node.js, and JavaScript frameworks\n" +
            "- Debugging and troubleshooting JavaScript code\n" +
            "- Best practices and coding patterns\n\n" +
            "Feel free to ask any JavaScript-related questions! I will be happy to assist you. 😊",
        );
        return "not_js";
      }

      const result =
        await domainSpecicalizedAssistantService.askDomainSpecicalizedAssistant(
          inputText,
        );
      setResponse(result);
      return "success";
    } catch (err) {
      // Log it once to your browser console to see the real structure
      console.error("AI Error:", err);

      const errorMessage =
        err.response?.data?.detail || err.message || "Something went wrong.";
      setError(errorMessage);
      return "error";
    } finally {

      setIsLoading(false);
    }
  };

  return { response, setResponse, isLoading, error, setError, askAi };
};
