// NavbarAuthButtons.js
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "react-bootstrap";

export default function NavbarAuthButtons() {
  const { isSignedIn } = useUser();

  return (
    <>
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <>
          <Button variant="outline-primary" href="/sign-in" className="ms-2">
            Login
          </Button>
          <Button variant="primary" href="/sign-up" className="ms-2">
            Sign Up
          </Button>
        </>
      )}
    </>
  );
}