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

  const host =
    headerList["x-forwarded-host"] || headerList["host"] || "localhost";
  const protocol = headerList["x-forwarded-proto"] || "https";
  const currentUrl = new URL(`${protocol}://${host}${req.url}`);

  const tokenSet = await client.authorizationCodeGrant(
    openIdClientConfig,
    currentUrl,
    {
      pkceCodeVerifier: session.code_verifier,
      expectedState: session.state,
      idTokenExpected: true,
    },
  );

  const { access_token } = tokenSet;
  session.isLoggedIn = true;
  session.access_token = access_token;

  let claims = tokenSet.claims() | "";
  const { sub } = claims;

  // call userinfo endpoint to get user info
  const userinfo = await client.fetchUserInfo(
    openIdClientConfig,
    access_token,
    client.skipSubjectCheck,
  );

  // store userinfo in session
  session.userInfo = {
    sub: userinfo.sub,
    name: userinfo.name || "",
    email: userinfo.email | "",
    email_verified: userinfo.email_verified || false,
    groups: userinfo.groups || [],
  };

  await session.save();
  return res.redirect(clientConfig.post_login_route);
}

/*import { getClient } from "../../../lib/oidc";
import { withSession } from "../../../lib/session";

export default withSession(async (req, res) => {
  const client = await getClient();

  const { code, state } = req.query;
  const storedState = req.session.state;
  const storedNonce = req.session.nonce;

  // Clean up the temporary values early
  delete req.session.state;
  delete req.session.nonce;
  await req.session.save();

  if (!storedState || storedState !== state) {
    return res.status(400).send("Invalid state");
  }

  try {
    const tokenSet = await client.callback(
      process.env.OIDC_REDIRECT_URI,
      { code, state },
      { nonce: storedNonce },
    );

    // Store the whole token set (or just id_token) in the session
    req.session.user = {
      idToken: tokenSet.id_token,
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      expiresAt: tokenSet.expires_at,
    };
    await req.session.save();

    // Redirect to a protected page (e.g., home)
    res.redirect("/");
  } catch (err) {
    console.error("OIDC callback error:", err);
    res.status(500).send("Authentication failed");
  }
});
*/
