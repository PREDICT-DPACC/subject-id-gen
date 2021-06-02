import { ObjectId } from 'mongodb';
import * as yup from 'yup';
import withSession from '../../../lib/session';
import { HttpError } from '../../../lib/errors';
import { connectToDatabase } from '../../../lib/db';
import { hash, verifyHash } from '../../../lib/hash';

export default withSession(async (req, res) => {
  const { method, session, body } = req;
  try {
    if (method === 'POST') {
      const { action } = body;
      if (action === 'change-details') {
        const { firstName, lastName } = body;
        const schema = yup.object().shape({
          firstName: yup.string().max(255).required(),
          lastName: yup.string().max(255).required(),
        });
        await schema.validate({ firstName, lastName });
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const userFromDb = await db
          .collection('users')
          .findOneAndUpdate(
            { _id: ObjectId(id) },
            { $set: { firstName, lastName } }
          );
        const { access, isVerified, email, role } = userFromDb.value;
        await db.collection('sites').updateMany(
          {
            'members.id': ObjectId(id),
          },
          {
            $set: {
              'members.$[elem].firstName': firstName,
              'members.$[elem].lastName': lastName,
            },
          },
          {
            arrayFilters: [{ 'elem.id': ObjectId(id) }],
          }
        );
        const newUserObj = {
          id,
          isLoggedIn: true,
          isVerified,
          email: email.toLowerCase(),
          access,
          role,
          firstName,
          lastName,
        };
        req.session.set('user', newUserObj);
        await req.session.save();
        res.status(200).json(newUserObj);
      } else if (action === 'change-password') {
        const { currentPassword, newPassword } = body;
        const schema = yup.object().shape({
          currentPassword: yup.string().min(6).required(),
          newPassword: yup.string().min(6).required(),
        });
        await schema.validate({ currentPassword, newPassword });
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const userJustPassHash = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { password: 1 });
        const storedHash = userJustPassHash.password;
        if (verifyHash({ text: currentPassword, original: storedHash })) {
          await db.collection('users').findOneAndUpdate(
            { _id: ObjectId(id) },
            {
              $set: {
                password: hash({ text: newPassword }),
              },
            }
          );
          res.status(200).json({ message: 'ok' });
        } else {
          throw new HttpError({
            statusCode: 403,
            message: 'Incorrect current password',
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
