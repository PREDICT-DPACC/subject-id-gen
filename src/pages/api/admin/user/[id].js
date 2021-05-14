import { ObjectId } from 'mongodb';
import withSession from '../../../../lib/session';
import { HttpError } from '../../../../lib/errors';
import { connectToDatabase } from '../../../../lib/db';

export default withSession(async (req, res) => {
  const { method, session, query, body } = await req;
  const userToFind = query.id;
  const { mode } = query;

  try {
    if (mode === 'find') {
      if (method !== 'GET') {
        throw new HttpError({
          statusCode: 405,
          message: `Method ${method} not allowed`,
        });
      } else {
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const foundRequester = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { role: 1 });
        const { role } = foundRequester;
        if (role !== 'admin') {
          throw new HttpError({
            statusCode: 403,
            message: 'Unauthorized',
          });
        } else {
          const foundUser = await db
            .collection('users')
            .findOne({ _id: ObjectId(userToFind) }, { password: 0 });
          res.status(200).json(foundUser);
        }
      }
    } else if (mode === 'promote') {
      if (method !== 'POST') {
        throw new HttpError({
          statusCode: 405,
          message: `Method ${method} not allowed`,
        });
      } else {
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const foundRequester = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { role: 1 });
        const { role } = foundRequester;
        if (role !== 'admin') {
          throw new HttpError({
            statusCode: 403,
            message: 'Unauthorized',
          });
        } else {
          const { sites } = body;
          const foundUser = await db
            .collection('users')
            .findOne(
              { _id: ObjectId(userToFind) },
              { access: 1, requestedSites: 1, firstName: 1, lastName: 1 }
            );
          const { requestedSites, access, firstName, lastName } = foundUser;
          const sitesToUpdate = access.filter(site =>
            sites.includes(site.siteId)
          );
          const sitesToPull = requestedSites.filter(site =>
            sites.includes(site)
          );
          const userAccessToPush = sites
            .filter(
              site => !access.some(accessEntry => accessEntry.siteId === site)
            )
            .map(site => ({
              siteId: site,
              siteRole: 'manager',
            }));
          const siteUserToPush = {
            id: ObjectId(userToFind),
            siteRole: 'manager',
            firstName,
            lastName,
          };

          // Update sites user is in
          await db.collection('sites').updateMany(
            {
              siteId: { $in: sites },
              'members.id': ObjectId(userToFind),
            },
            {
              $set: {
                'members.$.role': 'manager',
              },
            }
          );
          await db.collection('users').updateOne(
            {
              _id: ObjectId(userToFind),
              'access.siteId': { $in: sitesToUpdate },
            },
            {
              $set: {
                'access.$[].siteRole': 'manager',
              },
            }
          );

          // Put user in sites not already in
          await db.collection('sites').updateMany(
            {
              siteId: { $in: sites },
              'members.id': { $nin: [ObjectId(userToFind)] },
            },
            {
              $push: {
                members: siteUserToPush,
              },
            }
          );
          await db.collection('users').updateOne(
            { _id: ObjectId(userToFind) },
            {
              $push: {
                access: {
                  $each: userAccessToPush,
                },
              },
              $pull: {
                requestedSites: {
                  $in: sitesToPull,
                },
              },
            }
          );
          res.status(200).json(foundUser);
        }
      }
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
