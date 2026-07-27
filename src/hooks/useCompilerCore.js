import { useState, useEffect, useCallback, useRef } from 'react';
import { transpileCode, createSandboxWorkerCode } from '../utils/compilerUtils';

export const useCompilerCore = (initialCode = "", defaultAutoCompile = false) => {
  const [code, setCode] = useState(initialCode);
  const [autoCompile, setAutoCompile] = useState(defaultAutoCompile);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [documentOutput, setDocumentOutput] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error' | 'timeout'
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [interaction, setInteraction] = useState({ 
    open: false, type: '', message: '', value: '', resolve: null 
  });
  
  const executionRef = useRef(0);
  const activeWorkerRef = useRef(null);
  const activeTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);

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

  const clearOutput = useCallback(() => {
    setConsoleOutput("");
    setDocumentOutput("");
    setExecutionStatus('idle');
    setExecutionTimeMs(null);
    setTestResults(null);
  }, []);

  const resetCode = useCallback(() => {
    setCode(initialCode);
    clearOutput();
  }, [initialCode, clearOutput]);

  const executeCode = useCallback(async (testCases = []) => {
    const currentId = ++executionRef.current;
    
    // Terminate any existing running worker & timer
    cleanupActiveWorker();

    setConsoleOutput("");
    setDocumentOutput("");
    setExecutionStatus('running');
    setExecutionTimeMs(null);
    setTestResults(null);
    startTimeRef.current = performance.now();

    try {
      const transpiledCode = transpileCode(code);
      const workerCode = createSandboxWorkerCode(transpiledCode);

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const worker = new Worker(blobUrl);

      activeWorkerRef.current = worker;

      const startExecutionTimeout = () => {
        if (activeTimeoutRef.current) {
          clearTimeout(activeTimeoutRef.current);
        }
        activeTimeoutRef.current = setTimeout(() => {
          if (executionRef.current === currentId) {
            worker.terminate();
            URL.revokeObjectURL(blobUrl);
            activeWorkerRef.current = null;
            setExecutionStatus('timeout');
            setConsoleOutput(prev => prev + "\n[System Error]: Execution timed out (2000ms limit). Possible infinite loop detected.\n");
          }
        }, 2000);
      };

      // Infinite loop & timeout guard (2000ms hard stop)
      startExecutionTimeout();

      worker.onmessage = (e) => {
        if (executionRef.current !== currentId) return;

        const { type, status, text, interactionType, message, defaultValue } = e.data;

        if (type === 'CONSOLE_UPDATE') {
          setConsoleOutput(text);
          if (text.includes("Error:")) {
            setExecutionStatus('error');
          }
        } else if (type === 'DOCUMENT_UPDATE') {
          setDocumentOutput(text);
        } else if (type === 'INTERACTION_REQUEST') {
          // Pause timeout while waiting for user interaction
          if (activeTimeoutRef.current) {
            clearTimeout(activeTimeoutRef.current);
            activeTimeoutRef.current = null;
          }

          setInteraction({
            open: true,
            type: interactionType,
            message: message,
            value: defaultValue || '',
            resolve: (responseVal) => {
              setInteraction(prev => ({ ...prev, open: false }));
              if (executionRef.current === currentId && activeWorkerRef.current) {
                // Restart timeout after user responds
                startExecutionTimeout();
                activeWorkerRef.current.postMessage({
                  type: 'INTERACTION_RESPONSE',
                  value: responseVal
                });
              }
            }
          });
        } else if (type === 'DONE') {
          if (startTimeRef.current) {
            const elapsed = Math.round(performance.now() - startTimeRef.current);
            setExecutionTimeMs(elapsed);
          }
          if (e.data.testResults) {
            setTestResults(e.data.testResults);
          }
          if (activeTimeoutRef.current) {
            clearTimeout(activeTimeoutRef.current);
            activeTimeoutRef.current = null;
          }
          if (status === 'error') {
            setExecutionStatus('error');
          } else {
            setExecutionStatus(prev => (prev === 'error' ? 'error' : 'success'));
          }
          worker.terminate();
          URL.revokeObjectURL(blobUrl);
          activeWorkerRef.current = null;
        }
      };

      worker.onerror = (e) => {
        if (executionRef.current !== currentId) return;
        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        setExecutionStatus('error');
        setConsoleOutput(prev => prev + `Runtime Error: ${e.message || "Script error"}\n`);
        if (activeTimeoutRef.current) {
          clearTimeout(activeTimeoutRef.current);
          activeTimeoutRef.current = null;
        }
        worker.terminate();
        URL.revokeObjectURL(blobUrl);
        activeWorkerRef.current = null;
      };

      worker.postMessage({ type: 'EXECUTE', code: transpiledCode, testCases });

    } catch (err) {
      if (executionRef.current === currentId) {
        setExecutionStatus('error');
        setConsoleOutput(prev => prev + `Error: ${err.message}\n`);
      }
    }
  }, [code, cleanupActiveWorker]);

  useEffect(() => {
    if (isEditorReady && autoCompile) {
      const timer = setTimeout(() => executeCode(), 600);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady, executeCode, autoCompile]);

  useEffect(() => {
    return () => {
      cleanupActiveWorker();
    };
  }, [cleanupActiveWorker]);

  return {
    code, setCode,
    autoCompile, setAutoCompile,
    consoleOutput, setConsoleOutput,
    documentOutput, setDocumentOutput,
    isEditorReady, setIsEditorReady,
    executionStatus, executionTimeMs,
    interaction, setInteraction,
    testResults, setTestResults,
    executeCode, clearOutput, resetCode
  };
};
