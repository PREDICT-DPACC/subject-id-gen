import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';
import { getManagerDataForSiteReq } from '../../../lib/sites';
import { sendSiteRequest } from '../../../lib/mail';

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

    const { _id, email, access, requestedSites, role } = foundUser.value;

    const foundSites = await db
      .collection('sites')
      .find({ siteId: { $in: requestedSites } })
      .toArray();

    const emailData = await getManagerDataForSiteReq({ email, foundSites });
    const adminIdx = emailData.findIndex(datum => datum.user === 'admin');
    if (emailData[adminIdx].sites.length === 0) {
      emailData.splice(adminIdx, 1);
    }
    const finalEmailData = await Promise.all(
      emailData.map(async datum => {
        if (datum.user !== 'admin') {
          const manager = await db
            .collection('users')
            .findOne({ _id: ObjectId(datum.user) }, { email: 1 });
          return {
            ...datum,
            toEmail: manager.email,
          };
        }
        return {
          ...datum,
          toEmail: process.env.ADMIN_EMAIL,
        };
      })
    );
    await Promise.all(
      finalEmailData.map(async finalEmailDatum =>
        sendSiteRequest(finalEmailDatum)
      )
    );

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
