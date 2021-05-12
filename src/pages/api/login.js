import { verifyHash } from '../../lib/hash';
import withSession from '../../lib/session';
import { HttpError } from '../../lib/errors';

export default withSession(async (req, res) => {
  const { email, password } = await req.body;
  console.log(email);

  try {
    // Mongo call getting hashed PW from email (fake placeholder right now)
    // const mongoGetPw = await db.collection("users").find({ email }, { password: 1 })
    const mongoGetPw = { password: 'fake-hash' };

    // Verify hash
    const storedHash = mongoGetPw.password;
    if (verifyHash({ text: password, original: storedHash })) {
      // Mongo call getting the rest of user info (fake placeholder right now)
      // const mongoCall = await db.collection("users").find({ email })
      const mongoCall = { _id: 'fake-id' };
      const { _id, access } = mongoCall;
      const user = { isLoggedIn: true, id: _id, access };
      console.log(user);
      req.session.set('user', user);
      await req.session.save();
      res.json(user);
    } else {
      throw new HttpError({
        message: 'Incorrect email or password.',
        statusCode: 403,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
