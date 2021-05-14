import { ObjectId } from 'mongodb';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';

export default withSession(async (req, res) => {
  const { method, session } = await req;
  try {
    if (method !== 'GET') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    } else {
      const { id } = session.get('user');
      const { db } = await connectToDatabase();
      const foundUser = await db
        .collection('users')
        .findOne({ _id: ObjectId(id) }, { role: 1 });
      const { role } = foundUser;
      if (role !== 'admin') {
        throw new HttpError({
          statusCode: 403,
          message: 'Unauthorized',
        });
      } else {
        const sitesArray = await db.collection('sites').find().toArray();
        res.status(200).json({ sites: JSON.parse(JSON.stringify(sitesArray)) });
      }
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
