import withSession from '../../lib/session';
import { HttpError } from '../../lib/errors';
import { connectToDatabase } from '../../lib/db';
import { verifyHash } from '../../lib/hash';

export default withSession(async (req, res) => {
  const { method, body } = await req;

  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    }

    const { email, password } = body;

    const { db } = await connectToDatabase();

    const userJustPassHash = await db
      .collection('users')
      .findOne({ email }, { password: 1 });

    if (userJustPassHash == null) {
      throw new HttpError({
        message: 'Incorrect email or password.',
        statusCode: 403,
      });
    }

    // Verify hash
    const storedHash = userJustPassHash.password;
    if (verifyHash({ text: password, original: storedHash })) {
      // Mongo call getting the rest of user info
      const wholeUser = await db.collection('users').findOne({ email });
      const { _id, access } = wholeUser;
      const user = { isLoggedIn: true, id: _id, access };
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
