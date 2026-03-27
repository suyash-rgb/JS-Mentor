import { useState, useEffect, useCallback, useRef } from 'react';
import { transpileCode, getAsyncSafeWrapper } from '../utils/compilerUtils';

export const useCompilerCore = (initialCode = "") => {
  const [code, setCode] = useState(initialCode);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [documentOutput, setDocumentOutput] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [interaction, setInteraction] = useState({ 
    open: false, type: '', message: '', value: '', resolve: null 
  });
  
  const executionRef = useRef(0);

  const executeCode = useCallback(async () => {
    const currentId = ++executionRef.current;
    
    setConsoleOutput("");
    setDocumentOutput("");
    
    try {
      const transpiledCode = transpileCode(code);
      const safeCode = getAsyncSafeWrapper(transpiledCode);
      
      // eslint-disable-next-line no-new-func
      new Function('setInteraction', 'setConsoleOutput', 'setDocumentOutput', 'currentId', 'executionRef', safeCode)(
        setInteraction, 
        (val) => { if (executionRef.current === currentId) setConsoleOutput(val); }, 
        (val) => { if (executionRef.current === currentId) setDocumentOutput(val); },
        currentId,
        executionRef
      );

    } catch (err) {
      if (executionRef.current === currentId) {
        setConsoleOutput(prev => prev + `Error: ${err.message}\n`);
      }
    }
  }, [code]);

  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => executeCode(), 600);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady, executeCode]);

  return {
    code, setCode,
    consoleOutput, setConsoleOutput,
    documentOutput, setDocumentOutput,
    isEditorReady, setIsEditorReady,
    interaction, setInteraction,
    executeCode
  };
};
