import { useUser } from "@clerk/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { safeRedirect } from "#/lib/auth";

export const useLeaveWhenSignedIn = (redirect?: string) => {
  const { isLoaded, isSignedIn } = useUser();
  const { history } = useRouter();
  const signedIn = isLoaded && isSignedIn;

  useEffect(() => {
    if (signedIn) history.replace(safeRedirect(redirect));
  }, [signedIn, history, redirect]);

  return signedIn;
};
