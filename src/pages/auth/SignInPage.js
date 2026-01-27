import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <SignIn routing="path" path="/sign-in" />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Enrolled with our institute?</p>
        <Link to="/institute/login" style={{ color: '#007bff', fontWeight: 'bold' }}>
          SignIn here
        </Link>
      </div>
    </div>
  );
}