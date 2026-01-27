import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';


export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <SignUp routing="path" path="/sign-up" />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Enrolled with our institute?</p>
        <Link to="/institute/signup" style={{ color: '#007bff', fontWeight: 'bold' }}>
          SignUp here
        </Link>
      </div>
    </div>
  );
} 