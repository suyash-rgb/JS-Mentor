import React, { useState, useEffect } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // This ensures the institute link only renders after Clerk has likely finished its internal setup
    const timer = setTimeout(() => setIsReady(true), 600); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      {/* Clerk Component */}
      <SignUp routing="path" path="/sign-up" />

      {/* Institute Section - Only visible when ready */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        visibility: isReady ? 'visible' : 'hidden',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.5s ease-in'
      }}>
        <p style={{ margin: '5px 0', color: '#666' }}>Enrolled with our institute?</p>
        <Link to="/institute/signup" style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>
          SignUp here
        </Link>
      </div>
    </div> 
  );
}