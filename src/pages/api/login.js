import { hash, verifyHash } from '../../lib/hash';
import withSession from "../../lib/session";

export default withSession(async (req, res) => {
  const { email, password } = await req.body;

  const hashedPw = hash({ text: password });

  try {
    // Mongo call getting hashed PW from email (fake placeholder right now)
    // const mongoGetPw = await db.collection("users").find({ email }, { password: 1 })
    const mongoGetPw = { password: 'fake-hash' };

    // Verify hash
    const storedHash = mongoGetPw.password;
    if (verifyHash({ text: hashedPw, original: storedHash })) {
      // Mongo call getting the rest of user info (fake placeholder right now)
      // const mongoCall = await db.collection("users").find({ email })
      const mongoCall = { id: 'fake-id' };
      const { id } = mongoCall;
      const user = { isLoggedIn: true, id };
      req.session.set("user", user);
      await req.session.save();
      res.json(user);
    } else {
      throw { statusCode: 400, message: 'Unauthorized' };
    }
  } catch (error) {
    res.status(error.statusCode || 500).end(error.message);
  }
});
