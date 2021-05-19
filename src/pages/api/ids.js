import * as yup from 'yup';
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
      const { id, email } = session.get('user');
      const { siteId, action, quantity } = body;
      const { db } = await connectToDatabase();
      const schema = yup.object().shape({
        email: yup.string().email().required(),
        siteId: yup.string().max(2).required(),
      });
      await schema.validate({ email, siteId });
      const emailLower = email.toLowerCase();
      const foundUser = await db
        .collection('users')
        .findOne({ _id: ObjectId(id) }, { access: 1 });
      const { access } = foundUser;
      if (!access.some(site => site.siteId === siteId)) {
        throw new HttpError({
          statusCode: 403,
          message: 'Unauthorized',
        });
      } else if (action === 'generate') {
        const quantityN = parseInt(quantity, 10);
        const numSchema = yup.object().shape({
          quantityN: yup.number().max(100),
        });
        await numSchema.validate({ quantityN });
        const site = await db
          .collection('sites')
          .findOne({ siteId }, { idseq: 1 });
        const { idseq } = site;
        if (idseq + quantityN > 10000) {
          throw new HttpError({
            statuscode: 422,
            message: `There are not enough IDs left for that site. Remaining IDs: ${
              10000 - idseq
            }`,
          });
        } else {
          await db.collection('subjectids').updateMany(
            {
              site: siteId,
              index: {
                $gte: idseq,
                $lt: idseq + quantityN,
              },
              used: false,
            },
            {
              $set: {
                used: true,
                usedBy: emailLower,
              },
              $currentDate: {
                usedDate: true,
              },
            }
          );
          await db.collection('sites').updateOne(
            { siteId },
            {
              $set: { idseq: idseq + quantityN },
            }
          );
          const idArray = await db
            .collection('subjectids')
            .find(
              {
                site: siteId,
                index: {
                  $gte: idseq,
                  $lt: idseq + quantityN,
                },
              },
              {
                id: 1,
              }
            )
            .toArray();
          res.status(200).json({ ids: JSON.parse(JSON.stringify(idArray)) });
        }
      } else if (action === 'list-mine') {
        const idArray = await db
          .collection('subjectids')
          .find(
            {
              site: siteId,
              used: true,
              usedBy: emailLower,
            },
            {
              id: 1,
              usedDate: 1,
            }
          )
          .toArray();
        res.status(200).json({ ids: JSON.parse(JSON.stringify(idArray)) });
      } else if (action === 'list-all') {
        if (
          !(
            foundUser.role === 'admin' ||
            access.some(
              site => site.siteId === siteId && site.siteRole === 'manager'
            )
          )
        ) {
          throw new HttpError({
            statusCode: 403,
            message: 'Unauthorized',
          });
        } else {
          const idArray = await db
            .collection('subjectids')
            .find({
              site: siteId,
              used: true,
            })
            .toArray();
          res.status(200).json({ ids: JSON.parse(JSON.stringify(idArray)) });
        }
      } else {
        throw new HttpError({
          statuscode: 400,
          message: `No action parameter or action ${action} not supported`,
        });
      }
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
