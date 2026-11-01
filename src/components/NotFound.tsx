import { Link } from "@tanstack/react-router";

import { ConfusedDino } from "./Dino";

export const NotFound = () => (
  <main className="lg:px-column p-4 md:px-8 md:pt-5 lg:pt-6 lg:pb-16">
    <div className="lb-state">
      <ConfusedDino size={120} />
      <h1 className="font-display m-0 text-[1.375rem] leading-tight font-extrabold">
        We couldn’t find this page
      </h1>
      <p className="text-muted m-0 text-[0.9375rem] leading-normal">
        The link may be old or mistyped. Your library is one tap away.
      </p>
      <Link
        to="/"
        search={{ page: 1, q: "" }}
        className="lb-btn lb-btn--soft mt-1.5 px-5.5 text-[0.9375rem]"
      >
        Back to library
      </Link>
    </div>
  </main>
);
