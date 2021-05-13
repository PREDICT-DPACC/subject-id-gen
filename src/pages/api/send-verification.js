import { connectToDatabase } from '../../lib/db';
import { getToken } from '../../lib/token';
import { sendVerificationEmail } from '../../lib/mail';
import { HttpError } from '../../lib/errors';

export default async (req, res) => {
  const { method, body } = await req;
  const { email } = body;

  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    }
    const token = getToken();

    const { db } = await connectToDatabase();
    const userId = await db
      .collection('users')
      .findOne({ email: email.toLowerCase() }, { _id: 1 });
    const { _id } = userId;
    await db.collection('auth_tokens').insertOne({
      createdAt: new Date(),
      token,
      user: _id,
    });
    await sendVerificationEmail({ email, token });
    res.status(200).json({ message: 'ok' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
