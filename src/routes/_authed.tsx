import { SignInButton, useUser } from "@clerk/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

const AuthedLayout = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <SignInButton mode="modal">
          <button type="button" className="lb-btn lb-btn--primary">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return <Outlet />;
};

export const Route = createFileRoute("/_authed")({ component: AuthedLayout });
