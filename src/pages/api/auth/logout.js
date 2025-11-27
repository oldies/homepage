// pages/api/auth/logout.js
import * as client from "openid-client";

import { clientConfig, getClientConfig, getSession } from "../../../lib/auth";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const session = await getSession(req, res);

  const openIdClientConfig = await getClientConfig();
  const endSessionUrl = client.buildEndSessionUrl(openIdClientConfig, {
    post_logout_redirect_uri: clientConfig.post_logout_redirect_uri,
    id_token_hint: session.access_token || "",
  });
  session.isLoggedIn = defaultSession.isLoggedIn;
  session.access_token = defaultSession.access_token;
  session.userInfo = defaultSession.userInfo;
  session.code_verifier = defaultSession.code_verifier;
  session.state = defaultSession.state;
  await session.save();
  return res.redirect(endSessionUrl.href);
}
