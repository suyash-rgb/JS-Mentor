import axios from "axios";

/**
 * compilerUtils.js
 * Shared logic for JS transpilation, secure interactive mocking, and AI mentorship.
 */

const API_CONFIG = {
  URL: process.env.REACT_APP_GROK_API_URL || "https://api.groq.com/openai/v1/responses",
  KEY: process.env.REACT_APP_GROK_API_KEY,
  MODEL: process.env.REACT_APP_GROK_MODEL || "openai/gpt-oss-20b"
};

export const explainErrorWithAI = async (code, consoleOutput) => {
  const prompt = `You are a JavaScript expert. Explain this error briefly to a beginner. 
  Do NOT use tables. Provide a short explanation and the corrected code snippet only.
  
  CODE: ${code}
  ERROR: ${consoleOutput}`;

  try {
    const response = await axios.post(
      API_CONFIG.URL,
      {
        model: API_CONFIG.MODEL,
        input: prompt,
      },
      { headers: { Authorization: `Bearer ${API_CONFIG.KEY}`, "Content-Type": "application/json" } }
    );

    let generatedText = "I couldn't generate an explanation.";
    if (response.data?.output && Array.isArray(response.data.output)) {
      const messageObj = response.data.output.find(item => item.type === "message");
      if (messageObj?.content) {
        const textObj = messageObj.content.find(c => c.type === "output_text");
        if (textObj?.text) generatedText = textObj.text;
      }
    }
    return generatedText;
  } catch (error) {
    console.error("AI API Error:", error);
    return "## System Error\nI hit a snag connecting to the mentor brain.";
  }
};

export const transpileCode = (code) => {
  return code.replace(/\b(prompt|confirm|alert)\s*\(/g, 'await $1(');
};

export const getMockStyles = () => ({
  alert: 'background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;',
  confirm: 'background: rgba(46, 204, 113, 0.1); border-left: 4px solid #2ecc71; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;',
  prompt: 'background: rgba(155, 89, 182, 0.1); border-left: 4px solid #9b59b6; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;'
});

export const getAsyncSafeWrapper = (transpiledCode) => {
  const styles = getMockStyles();
  
  return `
    (async () => {
      let consoleResult = "";
      let documentResult = "";
      const originalConsoleLog = console.log;
      const originalDocumentWrite = document.write;
      
      const isExpired = () => executionRef.current !== currentId;

      const alert = async (msg) => {
        if (isExpired()) return;
        documentResult += '<div style="${styles.alert}"><strong>🔔 Alert:</strong> ' + msg + '</div>\\n';
        setDocumentOutput(documentResult);
        return new Promise(resolve => {
          setInteraction({ open: true, type: 'alert', message: msg, value: '', resolve: () => {
            setInteraction(prev => ({ ...prev, open: false }));
            resolve();
          }});
        });
      };
      
      const confirm = async (msg) => {
        if (isExpired()) return;
        documentResult += '<div style="${styles.confirm}"><strong>❓ Confirm:</strong> ' + msg + '</div>\\n';
        setDocumentOutput(documentResult);
        return new Promise(resolve => {
          setInteraction({ open: true, type: 'confirm', message: msg, value: '', resolve: (val) => {
            setInteraction(prev => ({ ...prev, open: false }));
            resolve(val);
          }});
        });
      };
      
      const prompt = async (msg, def) => {
        if (isExpired()) return;
        documentResult += '<div style="${styles.prompt}"><strong>💬 Prompt:</strong> ' + msg + (def ? ' <br/><small>(Default: ' + def + ')</small>' : '') + '</div>\\n';
        setDocumentOutput(documentResult);
        return new Promise(resolve => {
          setInteraction({ open: true, type: 'prompt', message: msg, value: def || '', resolve: (val) => {
            setInteraction(prev => ({ ...prev, open: false }));
            resolve(val);
          }});
        });
      };
      
      console.log = (...args) => {
        if (isExpired()) return;
        const text = args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ") + "\\n";
        consoleResult += text;
        setConsoleOutput(consoleResult);
        originalConsoleLog(...args);
      };

      document.write = (...args) => {
        if (isExpired()) return;
        const text = args.join("") + "\\n";
        documentResult += text;
        setDocumentOutput(documentResult);
      };

      const print = undefined;
      
      try {
        ${transpiledCode}
      } catch (err) {
        if (!isExpired()) {
          consoleResult += \`Error: \${err.message}\\n\`;
          setConsoleOutput(consoleResult);
        }
      } finally {
        if (!isExpired()) {
          console.log = originalConsoleLog;
          document.write = originalDocumentWrite;
        }
      }
    })()
  `;
};
