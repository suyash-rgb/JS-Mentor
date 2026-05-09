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
