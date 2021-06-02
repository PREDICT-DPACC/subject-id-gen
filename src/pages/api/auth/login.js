import * as yup from 'yup';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';
import { verifyHash } from '../../../lib/hash';

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

    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().min(6).required(),
    });
    await schema.validate({ email, password });

    const { db } = await connectToDatabase();

    const emailLower = email.toLowerCase();

    const userJustPassHash = await db
      .collection('users')
      .findOne({ email: emailLower }, { password: 1 });

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
      const wholeUser = await db
        .collection('users')
        .findOne({ email: emailLower });
      const { _id, access, isVerified, role, firstName, lastName } = wholeUser;
      const user = {
        id: _id,
        isLoggedIn: true,
        isVerified,
        email: emailLower,
        access,
        role,
        firstName,
        lastName,
      };
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
