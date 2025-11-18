// pages/api/widgets/user.jsx
import { getSession } from "../../../lib/auth"; // ← adapt to your auth lib

export default async function handler(req, res) {
  // Grab the current session (replace with your own logic)
  const session = await getSession(req, res);

  if (session) {
    //?.user) {
    res.status(200).json({
      user: {
        name: session.userInfo.name,
        avatarUrl: session.userInfo.image || "", // optional
      },
    });
  } else {
    res.status(200).json({ user: null });
  }
}
