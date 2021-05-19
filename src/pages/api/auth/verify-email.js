import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';

export default withSession(async (req, res) => {
  const { method, body } = await req;

  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    }

    const { verificationToken, userId } = body;

    const { db } = await connectToDatabase();

    const foundToken = await db
      .collection('auth_tokens')
      .findOne({ token: verificationToken, user: ObjectId(userId) });

    if (foundToken === null) {
      throw new HttpError({
        statusCode: 403,
        message: 'Token is incorrect or has expired.',
      });
    }

    const foundUser = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: { isVerified: true } }
      );

    const { _id, email, access, role } = foundUser.value;
    const user = {
      id: _id,
      isLoggedIn: true,
      isVerified: true,
      email: email.toLowerCase(),
      access,
      role,
    };
    req.session.set('user', user);
    await req.session.save();
    await db
      .collection('auth_tokens')
      .deleteOne({ token: verificationToken, user: ObjectId(userId) });
    res.json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
