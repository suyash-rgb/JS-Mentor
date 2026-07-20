import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
});

const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    if (chart) {
      const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart)
        .then((result) => {
          if (isMounted) {
            setSvg(result.svg);
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Mermaid rendering error:", error);
            setSvg(`<div class="text-red-500 text-sm font-bold p-4 bg-red-50 rounded border border-red-200">Mermaid Syntax Error: Check console for details.</div>`);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (!chart) return null;

  return (
    <div 
      className="mermaid-container flex justify-center my-6 overflow-x-auto bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default Mermaid;
