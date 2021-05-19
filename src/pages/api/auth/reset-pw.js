import { ObjectId } from 'mongodb';
import * as yup from 'yup';
import { connectToDatabase } from '../../../lib/db';
import { getToken } from '../../../lib/token';
import { sendPasswordResetEmail } from '../../../lib/mail';
import { HttpError } from '../../../lib/errors';
import { hash } from '../../../lib/hash';

export default async (req, res) => {
  const { method, body } = await req;
  const { action, email, token, newPassword } = body;

  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    } else if (action === 'send-email') {
      const schema = yup.object().shape({
        email: yup.string().max(255).email().required(),
      });
      await schema.validate({ email });
      const emailLower = email.toLowerCase();

      const newToken = getToken();

      const { db } = await connectToDatabase();
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
        await db.collection('reset_tokens').insertOne({
          createdAt: new Date(),
          token: newToken,
          user: ObjectId(_id),
        });
        await sendPasswordResetEmail({ email: emailLower, token: newToken });
        res.status(200).json({ message: 'ok' });
      }
    } else if (action === 'verify-token') {
      const { db } = await connectToDatabase();
      const schema = yup.object().shape({
        token: yup.string().length(64).required(),
      });
      await schema.validate({ token });
      const foundToken = await db.collection('reset_tokens').findOne({ token });
      if (foundToken === null) {
        throw new HttpError({
          statusCode: 404,
          message: 'This reset password token is invalid or expired.',
        });
      } else {
        res.status(200).json({ foundToken });
      }
    } else if (action === 'reset-password') {
      const { db } = await connectToDatabase();
      const schema = yup.object().shape({
        token: yup.string().required(),
        newPassword: yup.string().min(6).required(),
      });
      await schema.validate({ token, newPassword });
      const foundToken = await db.collection('reset_tokens').findOne({ token });
      const { user } = foundToken;
      const foundUser = await db.collection('users').findOneAndUpdate(
        { _id: ObjectId(user) },
        {
          $set: {
            password: hash({ text: newPassword }),
          },
        }
      );
      if (foundUser.value == null) {
        throw new HttpError({
          message: 'User for that token could not be found.',
          statusCode: 404,
        });
      }
      await db
        .collection('reset_tokens')
        .deleteOne({ token, user: ObjectId(user) });
      res.status(200).json({ message: 'ok' });
    } else {
      throw new HttpError({
        statusCode: 400,
        message: `No action parameter or action ${action} not supported`,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
