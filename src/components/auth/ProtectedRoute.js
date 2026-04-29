import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

export default function ProtectedRoute({ children }) {
  const isTrainer = localStorage.getItem('token') !== null && localStorage.getItem('role') === 'trainer';

  // If a trainer is logged in, bypass Clerk and grant access
  if (isTrainer) {
    return <>{children}</>;
  }

  // Otherwise, use standard Clerk authentication for students
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}