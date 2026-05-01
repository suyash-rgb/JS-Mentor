import React, { useState, useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignInPage() {
  const [isReady, setIsReady] = useState(false);

  // We wait for the component to mount before showing the institute link
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500); // 500ms delay to match Clerk load
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', opacity: isReady ? 1 : 0, transition: 'opacity 0.3s' }}>
      <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
      
      {isReady && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: '5px 0', color: '#666' }}>Are you a Trainer?</p>
          <Link to="/institute/login" style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      )}
    </div>
  );
}