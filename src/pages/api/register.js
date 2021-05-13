import withSession from '../../lib/session';
import { connectToDatabase } from '../../lib/db';
import { hash } from '../../lib/hash';
import { getToken } from '../../lib/token';
import { sendVerificationEmail } from '../../lib/mail';
import { HttpError } from '../../lib/errors';

export default withSession(async (req, res) => {
  const { method, body } = await req;
  const { firstName, lastName, email, password, sites } = body;

  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    }

    const { db } = await connectToDatabase();

    const userExists = await db
      .collection('users')
      .findOne({ email }, { _id: 1 });

    if (userExists !== null) {
      throw new HttpError({
        statusCode: 403,
        message: 'A user with that email aready exists.',
      });
    }

    const token = getToken();

    const role =
      process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase()
        ? 'admin'
        : 'user';

    const mongoRegistration = await db.collection('users').insertOne({
      email,
      firstName,
      lastName,
      password: hash({ text: password }),
      requestedSites: sites,
      access: [],
      role,
      isVerified: false,
    });

    const { _id, isVerified, access } = mongoRegistration.ops[0];

    await db.collection('auth_tokens').insertOne({
      createdAt: new Date(),
      token,
      user: _id,
    });

    await sendVerificationEmail({ email, token });

    const user = { id: _id, isLoggedIn: true, isVerified, email, access, role };
    req.session.set('user', user);
    await req.session.save();
    res.json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
