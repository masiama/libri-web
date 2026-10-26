import { useUser } from "@clerk/react";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const AuthedLayout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { href } = useLocation();
  const navigate = useNavigate();
  const signedOut = isLoaded && !isSignedIn;
  const redirected = useRef(false);

  useEffect(() => {
    if (!signedOut) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    void navigate({
      to: "/sign-in",
      search: href === "/" ? {} : { redirect: href },
      replace: true,
    });
  }, [signedOut, href, navigate]);

  return isLoaded && isSignedIn ? <Outlet /> : null;
};

export const Route = createFileRoute("/_authed")({ component: AuthedLayout });
