/**
 * compilerUtils.js
 * Shared logic for JS transpilation and secure interactive mocking.
 */

export const transpileCode = (code) => {
  return code.replace(/\b(prompt|confirm|alert)\s*\(/g, 'await $1(');
};

export const getMockStyles = () => ({
  alert: 'background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;',
  confirm: 'background: rgba(46, 204, 113, 0.1); border-left: 4px solid #2ecc71; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;',
  prompt: 'background: rgba(155, 89, 182, 0.1); border-left: 4px solid #9b59b6; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;'
});

export const createSandboxWorkerCode = (transpiledCode) => {
  const styles = getMockStyles();
  const escapedStyles = {
    alert: styles.alert.replace(/'/g, "\\'"),
    confirm: styles.confirm.replace(/'/g, "\\'"),
    prompt: styles.prompt.replace(/'/g, "\\'")
  };
  
  return `
    self.onmessage = async function(e) {
      const msg = e.data;
      
      if (msg && msg.type === 'INTERACTION_RESPONSE') {
        if (self.pendingInteractionResolve) {
          self.pendingInteractionResolve(msg.value);
          self.pendingInteractionResolve = null;
        }
        return;
      }
      
      if (msg && msg.type === 'EXECUTE') {
        let consoleResult = "";
        let documentResult = "";

        const formatArg = (arg) => {
          if (typeof arg === "object" && arg !== null) {
            try { return JSON.stringify(arg, null, 2); } catch (_) { return String(arg); }
          }
          return String(arg);
        };

        const consoleObj = {
          log: (...args) => {
            const text = args.map(formatArg).join(" ") + "\\n";
            consoleResult += text;
            self.postMessage({ type: 'CONSOLE_UPDATE', text: consoleResult });
          },
          error: (...args) => {
            const text = args.map(formatArg).join(" ") + "\\n";
            consoleResult += "Error: " + text;
            self.postMessage({ type: 'CONSOLE_UPDATE', text: consoleResult });
          },
          warn: (...args) => {
            const text = args.map(formatArg).join(" ") + "\\n";
            consoleResult += "Warning: " + text;
            self.postMessage({ type: 'CONSOLE_UPDATE', text: consoleResult });
          },
          info: (...args) => {
            const text = args.map(formatArg).join(" ") + "\\n";
            consoleResult += text;
            self.postMessage({ type: 'CONSOLE_UPDATE', text: consoleResult });
          }
        };

        const documentObj = {
          write: (...args) => {
            const text = args.join("") + "\\n";
            documentResult += text;
            self.postMessage({ type: 'DOCUMENT_UPDATE', text: documentResult });
          }
        };

        const requestInteraction = (type, message, defaultValue = '') => {
          return new Promise((resolve) => {
            self.pendingInteractionResolve = resolve;
            self.postMessage({ type: 'INTERACTION_REQUEST', interactionType: type, message, defaultValue });
          });
        };

        const alert = async (msg) => {
          documentResult += '<div style="${escapedStyles.alert}"><strong>🔔 Alert:</strong> ' + msg + '</div>\\n';
          self.postMessage({ type: 'DOCUMENT_UPDATE', text: documentResult });
          await requestInteraction('alert', msg, '');
        };

        const confirm = async (msg) => {
          documentResult += '<div style="${escapedStyles.confirm}"><strong>❓ Confirm:</strong> ' + msg + '</div>\\n';
          self.postMessage({ type: 'DOCUMENT_UPDATE', text: documentResult });
          return await requestInteraction('confirm', msg, false);
        };

        const prompt = async (msg, def) => {
          documentResult += '<div style="${escapedStyles.prompt}"><strong>💬 Prompt:</strong> ' + msg + (def ? ' <br/><small>(Default: ' + def + ')</small>' : '') + '</div>\\n';
          self.postMessage({ type: 'DOCUMENT_UPDATE', text: documentResult });
          return await requestInteraction('prompt', msg, def || '');
        };

        try {
          const runFn = new Function(
            'console', 'document', 'alert', 'confirm', 'prompt',
            'window', 'localStorage', 'sessionStorage', 'cookie',
            \`return (async () => {
              \${msg.code}
            })();\`
          );

          await runFn(
            consoleObj, documentObj, alert, confirm, prompt,
            undefined, undefined, undefined, undefined
          );

          let testResults = [];
          if (msg.testCases && Array.isArray(msg.testCases)) {
            testResults = msg.testCases.map((tc) => {
              const passed = consoleResult.includes(tc.expected);
              return { expected: tc.expected, passed };
            });
          }

          self.postMessage({ type: 'DONE', status: 'success', consoleResult, documentResult, testResults });
        } catch (err) {
          consoleResult += "Runtime Error: " + err.message + "\\n";
          self.postMessage({ type: 'CONSOLE_UPDATE', text: consoleResult });
          self.postMessage({ type: 'DONE', status: 'error', error: err.message, consoleResult, documentResult, testResults: [] });
        }
      }
    };
  `;
};
