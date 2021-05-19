import * as yup from 'yup';
import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';

const hasAccessToSite = async ({ db, userId, siteId }) => {
  const foundUser = await db
    .collection('users')
    .findOne({ _id: ObjectId(userId) }, { access: 1, role: 1 });
  return (
    foundUser !== null &&
    (foundUser.role === 'admin' ||
      foundUser.access.some(
        siteAccess =>
          siteAccess.siteRole === 'manager' && siteAccess.siteId === siteId
      ))
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
      const { id } = session.get('user');
      const { db } = await connectToDatabase();
      const { action, userId, userEmail } = body;
      const schema = yup.object().shape({
        action: yup.string().required(),
        userId: yup.string().required(),
        userEmail: yup.string().email().required(),
      });
      await schema.validate({ action, userId, userEmail });
      if (hasAccessToSite({ db, userId: id, siteId })) {
        if (action === 'add-user') {
          const emailLower = userEmail.toLowerCase();
          const foundUser = await db
            .collection('users')
            .findOne({ email: emailLower }, { access: 1 });
          if (foundUser === null) {
            throw new HttpError({
              statuscode: 404,
              message: 'User not found with that email',
            });
          } else if (
            foundUser.access.some(siteAccess => siteAccess.siteId === siteId)
          ) {
            throw new HttpError({
              statuscode: 422,
              message: 'User is already a member of site',
            });
          } else {
            const user = await db.collection('users').findOneAndUpdate(
              {
                email: emailLower,
              },
              {
                $push: { access: { siteId, siteRole: 'member' } },
              },
              { projection: { firstName: 1, lastName: 1 } }
            );
            const { _id, firstName, lastName } = user.value;
            const site = await db.collection('sites').findOneAndUpdate(
              { siteId },
              {
                $push: {
                  members: {
                    id: ObjectId(_id),
                    siteRole: 'member',
                    firstName,
                    lastName,
                  },
                },
              },
              { returnOriginal: false }
            );
            res.status(200).json(site.value);
          }
        } else if (action === 'remove-user') {
          await db.collection('users').findOneAndUpdate(
            {
              _id: ObjectId(userId),
            },
            {
              $pull: { access: { siteId } },
            }
          );
          const site = await db.collection('sites').findOneAndUpdate(
            { siteId },
            {
              $pull: { members: { id: ObjectId(userId) } },
            },
            { returnOriginal: false }
          );
          res.status(200).json(site.value);
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
            message: `No action parameter or action ${action} not supported`,
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
