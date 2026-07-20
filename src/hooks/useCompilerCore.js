import { useState, useEffect, useCallback, useRef } from 'react';
import { transpileCode, createSandboxWorkerCode } from '../utils/compilerUtils';

export const useCompilerCore = (initialCode = "") => {
  const [code, setCode] = useState(initialCode);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [documentOutput, setDocumentOutput] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [interaction, setInteraction] = useState({ 
    open: false, type: '', message: '', value: '', resolve: null 
  });
  
  const executionRef = useRef(0);
  const activeWorkerRef = useRef(null);
  const activeTimeoutRef = useRef(null);

  const cleanupActiveWorker = useCallback(() => {
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate();
      activeWorkerRef.current = null;
    }
  }, []);

  const executeCode = useCallback(async () => {
    const currentId = ++executionRef.current;
    
    // Terminate any existing running worker & timer
    cleanupActiveWorker();

    setConsoleOutput("");
    setDocumentOutput("");

    try {
      const transpiledCode = transpileCode(code);
      const workerCode = createSandboxWorkerCode(transpiledCode);

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const worker = new Worker(blobUrl);

      activeWorkerRef.current = worker;

      // Infinite loop & timeout guard (2000ms hard stop)
      activeTimeoutRef.current = setTimeout(() => {
        if (executionRef.current === currentId) {
          worker.terminate();
          URL.revokeObjectURL(blobUrl);
          activeWorkerRef.current = null;
          setConsoleOutput(prev => prev + "\n[System Error]: Execution timed out (2000ms limit). Possible infinite loop detected.\n");
        }
      }, 2000);

      worker.onmessage = (e) => {
        if (executionRef.current !== currentId) return;

        const { type, status, text, interactionType, message, defaultValue } = e.data;

        if (type === 'CONSOLE_UPDATE') {
          setConsoleOutput(text);
        } else if (type === 'DOCUMENT_UPDATE') {
          setDocumentOutput(text);
        } else if (type === 'INTERACTION_REQUEST') {
          setInteraction({
            open: true,
            type: interactionType,
            message: message,
            value: defaultValue || '',
            resolve: (responseVal) => {
              setInteraction(prev => ({ ...prev, open: false }));
              if (executionRef.current === currentId && activeWorkerRef.current) {
                activeWorkerRef.current.postMessage({
                  type: 'INTERACTION_RESPONSE',
                  value: responseVal
                });
              }
            }
          });
        } else if (type === 'DONE') {
          if (activeTimeoutRef.current) {
            clearTimeout(activeTimeoutRef.current);
            activeTimeoutRef.current = null;
          }
          worker.terminate();
          URL.revokeObjectURL(blobUrl);
          activeWorkerRef.current = null;
        }
      };

      worker.postMessage({ type: 'EXECUTE', code: transpiledCode });

    } catch (err) {
      if (executionRef.current === currentId) {
        setConsoleOutput(prev => prev + `Error: ${err.message}\n`);
      }
    }
  }, [code, cleanupActiveWorker]);

  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => executeCode(), 600);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady, executeCode]);

  useEffect(() => {
    return () => {
      cleanupActiveWorker();
    };
  }, [cleanupActiveWorker]);

  return {
    code, setCode,
    consoleOutput, setConsoleOutput,
    documentOutput, setDocumentOutput,
    isEditorReady, setIsEditorReady,
    interaction, setInteraction,
    executeCode
  };
};
