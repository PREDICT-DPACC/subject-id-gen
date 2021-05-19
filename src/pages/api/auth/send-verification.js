import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/db';
import { getToken } from '../../../lib/token';
import { sendVerificationEmail } from '../../../lib/mail';
import { HttpError } from '../../../lib/errors';

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
    const emailLower = email.toLowerCase();
    const userId = await db
      .collection('users')
      .findOne({ email: emailLower }, { _id: 1 });
    if (userId === null) {
      throw new HttpError({
        statusCode: 404,
        message: `User with email ${emailLower} not found.`,
      });
    } else {
      const { _id } = userId;
      await db.collection('auth_tokens').insertOne({
        createdAt: new Date(),
        token,
        user: ObjectId(_id),
      });
      await sendVerificationEmail({ email: emailLower, token });
      res.status(200).json({ message: 'ok' });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
