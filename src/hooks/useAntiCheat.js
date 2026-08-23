import { useState, useEffect, useRef } from 'react';

export const useAntiCheat = ({
  enabled = true,
  resetKey = null,
  onViolation = () => {},
  onThresholdExceeded = () => {},
  cooldown = 1000,
  maxWarnings = 3,
}) => {
  const [warningCount, setWarningCount] = useState(0);
  const [isSidebarBlocked, setIsSidebarBlocked] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);

  const lastHandledRef = useRef(0);
  const warningCountRef = useRef(0);

  // Keep refs updated to prevent closure stale state in event listeners
  const onViolationRef = useRef(onViolation);
  const onThresholdExceededRef = useRef(onThresholdExceeded);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onThresholdExceededRef.current = onThresholdExceeded;
  });

  // Sync warningCount ref
  useEffect(() => {
    warningCountRef.current = warningCount;
  }, [warningCount]);

  // Reset states when resetKey or enabled changes
  useEffect(() => {
    setWarningCount(0);
    setIsSidebarBlocked(false);
    setShowWarningAlert(false);
    lastHandledRef.current = 0;
    warningCountRef.current = 0;
  }, [resetKey, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleSecurityEvent = (type) => {
      const now = Date.now();
      if (now - lastHandledRef.current < cooldown) return;
      lastHandledRef.current = now;

      const newCount = warningCountRef.current + 1;
      setWarningCount(newCount);
      setShowWarningAlert(true);
      onViolationRef.current(type, newCount);

      if (newCount > maxWarnings) {
        onThresholdExceededRef.current(newCount);
      }
    };

    // 1. Multi-monitor Check
    if (window.screen && typeof window.screen.isExtended !== 'undefined') {
      if (window.screen.isExtended) {
        handleSecurityEvent('Multiple monitors detected');
      }
    }

    // 2. DevTools Detached Check (Debugger Loop)
    let debuggerInterval;
    if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_DEVTOOLS_BLOCK === 'true') {
      debuggerInterval = setInterval(() => {
        const start = performance.now();
        debugger;
        if (performance.now() - start > 100) {
          handleSecurityEvent('DevTools active (detached)');
        }
      }, 1000);
    }

    // 3. Intercept Console execution
    const originalConsole = {
      log: window.console.log,
      info: window.console.info,
      warn: window.console.warn,
      error: window.console.error,
      dir: window.console.dir,
      debug: window.console.debug,
      clear: window.console.clear
    };

    const interceptConsole = (methodName) => {
      if (methodName === 'clear') return;
      window.console[methodName] = function(...args) {
        const err = new Error();
        const stack = err.stack || '';
        
        // Detect if executed from DevTools console or eval
        const isConsoleEval = 
          stack.includes('<anonymous>') || 
          stack.includes('eval') || 
          stack.includes('at VM') ||
          (stack && !stack.includes('.js') && !stack.includes('bundle') && !stack.includes('node_modules'));
          
        if (isConsoleEval) {
          handleSecurityEvent('Console execution');
          if (originalConsole.clear) {
            originalConsole.clear();
          }
        }
        
        // Call original method
        if (originalConsole[methodName]) {
          originalConsole[methodName].apply(window.console, args);
        }
      };
    };

    Object.keys(originalConsole).forEach(interceptConsole);

    // 4. Sidebar/DevTools Docked Check (Viewport ratio signatures)
    const baseWidthDiff = window.outerWidth - window.innerWidth;
    const baseHeightDiff = window.outerHeight - window.innerHeight;

    const checkSidebarOpen = () => {
      const widthRatio = window.innerWidth / window.outerWidth;
      const heightRatio = window.innerHeight / window.outerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      const widthDelta = widthDiff - baseWidthDiff;
      const heightDelta = heightDiff - baseHeightDiff;

      // Thresholds:
      // Docked to the side: widthRatio < 0.85 and absolute width difference > 150px
      // Docked to the bottom: heightRatio < 0.70 and absolute height difference > 250px
      const isSideDocked = widthRatio < 0.85 && widthDelta > 150;
      const isBottomDocked = heightRatio < 0.70 && heightDelta > 250;

      return isSideDocked || isBottomDocked;
    };

    // Initial check
    const initialCheck = checkSidebarOpen();
    if (initialCheck) {
      setIsSidebarBlocked(true);
      handleSecurityEvent('External panel/DevTools detected');
    }

    let sidebarCurrentlyBlocked = initialCheck;

    // 5. Visibility and Focus Change event handlers
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSecurityEvent('Tab switch');
      }
    };

    const handleBlur = () => {
      handleSecurityEvent('Window focus lost');
    };

    const handlePageHide = () => {
      handleSecurityEvent('Session hibernated or backgrounded');
    };

    const handleResize = () => {
      const isOpen = checkSidebarOpen();
      setIsSidebarBlocked(isOpen);
      
      if (isOpen && !sidebarCurrentlyBlocked) {
        sidebarCurrentlyBlocked = true;
        handleSecurityEvent('External panel/DevTools detected');
      } else if (!isOpen && sidebarCurrentlyBlocked) {
        sidebarCurrentlyBlocked = false;
      }
    };

    // 6. Keyboard and Context Menu prevention
    const handleKeyDown = (e) => {
      // Block F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        handleSecurityEvent('DevTools shortcut (F12)');
      }
      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K', 'i', 'j', 'c', 'k'].includes(e.key)) {
        e.preventDefault();
        handleSecurityEvent('DevTools shortcut');
      }
      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key)) {
        e.preventDefault();
        handleSecurityEvent('View Source shortcut');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      if (debuggerInterval) clearInterval(debuggerInterval);
      
      // Restore original console methods
      Object.keys(originalConsole).forEach((methodName) => {
        window.console[methodName] = originalConsole[methodName];
      });
    };
  }, [enabled, resetKey, cooldown, maxWarnings]);

  return {
    warningCount,
    setWarningCount,
    isSidebarBlocked,
    showWarningAlert,
    setShowWarningAlert,
  };
};
