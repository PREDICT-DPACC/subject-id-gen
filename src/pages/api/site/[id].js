import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';

const hasAccessToSite = async ({ db, userId, siteId }) => {
  const foundUser = await db
    .collection('users')
    .findOne({ _id: ObjectId(userId) }, { access: 1, role: 1 });
  return (
    foundUser.role === 'admin' ||
    foundUser.access.some(
      siteAccess =>
        siteAccess.siteRole === 'manager' && siteAccess.siteId === siteId
    )
  );
};

export default withSession(async (req, res) => {
  const { method, session, query, body } = await req;
  try {
    if (method === 'GET') {
      const siteId = query.id;
      const { id } = session.get('user');
      const { db } = await connectToDatabase();
      if (hasAccessToSite({ db, userId: id, siteId })) {
        const site = await db.collection('sites').findOne({ siteId });
        res.status(200).json(site);
      } else {
        throw new HttpError({
          statusCode: 403,
          message: 'Unauthorized',
        });
      }
    } else if (method === 'POST') {
      const siteId = query.id;
      const { db } = await connectToDatabase();
      const { action, userId } = body;
      if (hasAccessToSite({ db, userId, siteId })) {
        if (action === 'add-user') {
          // Add user to site as member
          // Add site to user
          const site = await db.collection('sites').findOne({ siteId });
          res.status(200).json(site);
        } else if (action === 'remove-user') {
          // Remove user from site
          // Remove site from user
          const site = await db.collection('sites').findOne({ siteId });
          res.status(200).json(site);
        } else if (action === 'change-role') {
          const { newRole } = body;
          await db.collection('users').findOneAndUpdate(
            {
              _id: ObjectId(userId),
              'access.siteId': siteId,
            },
            {
              $set: {
                'access.$.siteRole': newRole,
              },
            }
          );
          const site = await db.collection('sites').findOneAndUpdate(
            { siteId, 'members.id': ObjectId(userId) },
            {
              $set: {
                'members.$.siteRole': newRole,
              },
            },
            { returnOriginal: false }
          );
          res.status(200).json(site.value);
        } else {
          throw new HttpError({
            statuscode: 400,
            message: `No action field or action ${action} not supported`,
          });
        }
      } else {
        throw new HttpError({
          statusCode: 403,
          message: 'Unauthorized',
        });
      }
      res.status(200);
    } else {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
