import { getSession } from "../../../lib/auth";

import { servicesResponse } from "utils/config/api-response";

export default async function handler(req, res) {
  const session = await getSession(req, res);

  if (!session.userInfo) session.userInfo = {};

  res.send(await servicesResponse(JSON.parse(JSON.stringify(session.userInfo))));
}
