// lib/auth.js
import { IronSession, getIronSession } from "iron-session";
import * as client from "openid-client";

/* ------------------------------------------------------------------
   Configuration for the OpenID Connect client (environment‑driven)
------------------------------------------------------------------- */
export const clientConfig = {
  url: process.env.NEXT_PUBLIC_API_URL,
  audience: process.env.NEXT_PUBLIC_API_URL,
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  scope: process.env.NEXT_PUBLIC_SCOPE,
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: `${process.env.NEXT_PUBLIC_APP_URL}`,
  code_challenge_method: "S256",
};

/**
 * @typedef {Object} UserInfo
 * @property {string}  sub
 * @property {string}  name
 * @property {string}  email
 * @property {boolean} email_verified
 */

/**
 * @typedef {Object} SessionData
 * @property {boolean}  isLoggedIn
 * @property {string}   [access_token]
 * @property {string}   [code_verifier]
 * @property {string}   [state]
 * @property {UserInfo} [userInfo]
 */

/** @type {SessionData} */
export const defaultSession = {
  isLoggedIn: false,
  access_token: undefined,
  code_verifier: undefined,
  state: undefined,
  userInfo: undefined,
};

/* ------------------------------------------------------------------
   Iron‑session options
------------------------------------------------------------------- */
export const sessionOptions = {
  password: "complex_password_at_least_32_characters_long", // 32‑64 chars
  cookieName: "next_js_session",
  cookieOptions: {
    // secure only works in HTTPS environments
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 60 * 60 * 24 * 7, // 1 week
};

// Session options – reuse a single config for all protected routes
/*const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD, // 32‑64 chars
  cookieName: "oidc_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};*/

/**
 * Retrieves the current session (or creates a default one).
 *
 * @returns {Promise<IronSession<SessionData>>}
 */
export async function getSession(req, res) {
  /** @type {IronSession<SessionData>} */
  const session = await getIronSession(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    session.access_token = defaultSession.access_token;
    session.userInfo = defaultSession.userInfo;
  }
  return session;
}

/**
 * Performs OpenID discovery and returns the client configuration.
 *
 * @returns {Promise<any>}  // the exact type depends on openid-client
 */
export async function getClientConfig() {
  // `client.discovery` expects a URL object and the client_id.
  return await client.discovery(
    new URL(clientConfig.url),
    clientConfig.clientId,
    clientConfig.clientSecret,
    /*client.ClientAuth | undefined,
    {
      execute: [client.allowInsecureRequests],
      },*/
  );
}
