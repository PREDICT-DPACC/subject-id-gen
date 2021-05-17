import { ObjectId } from 'mongodb';
import withSession from '../../lib/session';
import { HttpError } from '../../lib/errors';
import { connectToDatabase } from '../../lib/db';

export default withSession(async (req, res) => {
  const { method, session, body } = await req;
  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    } else {
      const { id } = session.get('user');
      const { sites } = body;
      const { db } = await connectToDatabase();
      const foundUser = await db
        .collection('users')
        .findOne({ _id: ObjectId(id) }, { access: 1 });
      const { access } = foundUser;
      await Promise.all(
        sites.map(site => {
          if (
            !access.some(
              siteAccess =>
                siteAccess.siteRole === 'manager' && siteAccess.siteId === site
            )
          ) {
            return Promise.reject(
              new HttpError({
                statusCode: 403,
                message: 'Unauthorized',
              })
            );
          }
          return Promise.resolve();
        })
      );
      const sitesArray = await db
        .collection('sites')
        .find({ siteId: { $in: sites } })
        .toArray();
      res.status(200).json({ sites: JSON.parse(JSON.stringify(sitesArray)) });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
