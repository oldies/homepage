// pages/api/auth/login.js
import * as client from "openid-client";

import { clientConfig, getClientConfig, getSession } from "../../../lib/auth";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const session = await getSession(req, res);
  let code_verifier = client.randomPKCECodeVerifier();
  let code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
  const openIdClientConfig = await getClientConfig();

  const parameters = {
    redirect_uri: clientConfig.redirect_uri,
    scope: clientConfig.scope || "",
    code_challenge,
    code_challenge_method: clientConfig.code_challenge_method,
  };

  const state = client.randomState();
  parameters.state = state;

  if (!openIdClientConfig.serverMetadata().supportsPKCE()) {
    const nonce = client.randomNonce();
    parameters.nonce = nonce;
  }

  let redirectTo = client.buildAuthorizationUrl(openIdClientConfig, parameters);
  session.code_verifier = code_verifier;
  session.state = state;
  await session.save();
  return res.redirect(redirectTo.href);
}

