import * as yup from 'yup';
import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';
import generateIds from '../../../../scripts/genIds';

export default withSession(async (req, res) => {
  const { method, session, body } = await req;
  try {
    if (method === 'GET') {
      const { id } = session.get('user');
      const { db } = await connectToDatabase();
      const foundUser = await db
        .collection('users')
        .findOne({ _id: ObjectId(id) }, { role: 1 });
      const { role } = foundUser;
      if (role === 'admin') {
        const sitesArray = await db.collection('sites').find().toArray();
        res.status(200).json({ sites: JSON.parse(JSON.stringify(sitesArray)) });
      } else {
        throw new HttpError({
          statusCode: 403,
          message: 'Unauthorized',
        });
      }
    } else if (method === 'POST') {
      const { action, siteId, name, network } = body;
      if (action === 'add-site') {
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const foundUser = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { role: 1 });
        const { role } = foundUser;
        if (role === 'admin') {
          const schema = yup.object().shape({
            siteId: yup
              .string()
              .max(2)
              .matches(/[A-Z][A-Z]/, 'Site ID must be two letters')
              .required(),
            name: yup.string().max(255).required(),
            network: yup.string().required(),
          });
          const foundSite = await db.collection('sites').findOne({
            $or: [{ siteId }, { name }],
          });
          if (foundSite === null) {
            await schema.validate({ siteId, name, network });
            await db.collection('sites').insertOne({
              siteId,
              name,
              network,
              idseq: 1,
              members: [],
            });
            const idsForSite = generateIds({ site: siteId, n: 9999 });
            await db.collection('subjectids').insertMany(idsForSite);
            res.status(200).json({ message: 'ok' });
          } else {
            throw new HttpError({
              statusCode: 422,
              message: 'A site with that ID or name already exists',
            });
          }
        } else {
          throw new HttpError({
            statusCode: 403,
            message: 'Unauthorized',
          });
        }
      } else {
        throw new HttpError({
          statusCode: 400,
          message: `No action parameter or action ${action} not supported`,
        });
      }
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
