import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/onest";
import "@fontsource-variable/unbounded";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import "../styles.css";

export const Route = createRootRoute({ component: Outlet });
