import { useUser } from "@clerk/react";
import { Navigate, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";

const AuthedLayout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { href } = useLocation();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" search={{ redirect: href }} replace />;

  return <Outlet />;
};

export const Route = createFileRoute("/_authed")({ component: AuthedLayout });
