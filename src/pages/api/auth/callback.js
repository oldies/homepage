// pages/api/auth/callback.js
import * as client from "openid-client";

import { clientConfig, getClientConfig, getSession } from "../../../lib/auth";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const session = await getSession(req, res);
  const openIdClientConfig = await getClientConfig();

  const headerList = req.headers;

  const host = headerList["x-forwarded-host"] || headerList["host"] || "localhost";
  const protocol = headerList["x-forwarded-proto"] || "https";
  const currentUrl = new URL(`${protocol}://${host}${req.url}`);

  const tokenSet = await client.authorizationCodeGrant(openIdClientConfig, currentUrl, {
    pkceCodeVerifier: session.code_verifier,
    expectedState: session.state,
    idTokenExpected: true,
  });

  const { access_token } = tokenSet;
  session.isLoggedIn = true;
  session.access_token = access_token;

  let claims = tokenSet.claims() | "";
  const { sub } = claims;

  // call userinfo endpoint to get user info
  const userinfo = await client.fetchUserInfo(openIdClientConfig, access_token, client.skipSubjectCheck);

  // store userinfo in session
  session.userInfo = {
    sub: userinfo.sub,
    name: userinfo.name || "",
    email: userinfo.email | "",
    email_verified: userinfo.email_verified || false,
    groups: userinfo.groups || [],
    roles: userinfo.roles || [],
  };

  await session.save();
  return res.redirect(clientConfig.post_login_route);
}
