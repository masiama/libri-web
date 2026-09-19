import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

const Home = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="p-8">
      <p>{user.primaryEmailAddress?.emailAddress}</p>
      <SignOutButton>
        <button type="button">Sign out</button>
      </SignOutButton>
    </div>
  );
};

export const Route = createFileRoute("/")({ component: Home });
