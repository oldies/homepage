// middleware.js
import { getIronSession } from "iron-session";
import { sessionOptions } from "lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/* -------------------------------------------------
   1️⃣  Host‑validation (your existing code)
   ------------------------------------------------- */
export function middleware(req) {
  // ---- Host validation -------------------------------------------------
  const host = req.headers.get("host");
  const port = process.env.PORT || 3000;
  let allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
  const allowAll = process.env.HOMEPAGE_ALLOWED_HOSTS === "*";

  if (process.env.HOMEPAGE_ALLOWED_HOSTS) {
    allowedHosts = allowedHosts.concat(
      process.env.HOMEPAGE_ALLOWED_HOSTS.split(","),
    );
  }

  if (!allowAll && (!host || !allowedHosts.includes(host))) {
    // eslint-disable-next-line no-console
    console.error(
      `Host validation failed for: ${host}. Hint: Set the HOMEPAGE_ALLOWED_HOSTS environment variable to allow requests from this host / port.`,
    );
    return NextResponse.json(
      { error: "Host validation failed. See logs for more details." },
      { status: 400 },
    );
  }

  // ---- Iron‑session auth check -----------------------------------------
  // Paths that require a logged‑in user. Adjust to your app’s structure.
  const protectedPrefixes = [
    "/protected-middleware",
    "/dashboard",
    "/api/bookmarks", // example API route
  ];

  const needsAuth = protectedPrefixes.some((p) =>
    req.nextUrl.pathname.startsWith(p),
  );

  if (needsAuth) {
    // Load the session from the encrypted cookie
    // `cookies()` works in edge runtime; it reads the request’s cookies
    const sessionPromise = getIronSession(cookies(), sessionOptions);
    // Because `middleware` can be async, we await the promise
    return (async () => {
      const session = await sessionPromise;

      if (!session.isLoggedIn) {
        // Preserve the original destination so the login flow can send the user back
        const loginUrl = new URL("/api/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // User is authenticated – continue to the next handler
      return NextResponse.next();
    })();
  }

  // No auth needed – just continue
  return NextResponse.next();
}

/* -------------------------------------------------
   2️⃣  Matcher – run for API routes *and* any
       protected‑middleware paths you defined above
   ------------------------------------------------- */
export const config = {
  matcher: [
    "/api/:path*", // existing API routes
    "/protected-middleware/:path*", // example protected route
    "/dashboard/:path*", // add more as needed
  ],
};
