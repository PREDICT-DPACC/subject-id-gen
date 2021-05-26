import { ObjectId } from 'mongodb';
import withSession from '../../lib/session';
import { HttpError } from '../../lib/errors';
import { connectToDatabase } from '../../lib/db';
import { sendSiteRequest } from '../../lib/mail';
import { getManagerDataForSiteReq } from '../../lib/sites';

export default withSession(async (req, res) => {
  const { method, session, body } = await req;
  try {
    if (method !== 'POST') {
      throw new HttpError({
        statusCode: 405,
        message: `Method ${method} not allowed`,
      });
    } else {
      const { sites, action } = body;
      if (action === 'manage') {
        const { id } = session.get('user');
        const { db } = await connectToDatabase();
        const foundUser = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { access: 1 });
        const { access } = foundUser;
        await Promise.all(
          sites.map(site => {
            if (
              !(
                foundUser.role === 'admin' ||
                access.some(
                  siteAccess =>
                    siteAccess.siteId === site &&
                    siteAccess.siteRole === 'manager'
                )
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
      } else if (action === 'names') {
        const { db } = await connectToDatabase();
        const sitesArray = await db
          .collection('sites')
          .find({}, { siteId: 1, name: 1, network: 1, _id: 0 })
          .toArray();
        res.status(200).json({ sites: JSON.parse(JSON.stringify(sitesArray)) });
      } else if (action === 'request-access') {
        const { db } = await connectToDatabase();
        const { email, id } = session.get('user');
        const foundUser = await db
          .collection('users')
          .findOne({ _id: ObjectId(id) }, { access: 1 });
        const { access } = foundUser;
        const sitesToReq = sites.filter(
          site => !access.some(siteAccess => siteAccess.siteId === site)
        );
        const foundSites = await db
          .collection('sites')
          .find({ siteId: { $in: sitesToReq } })
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
        res.status(200).json({ message: 'ok' });
      } else {
        throw new HttpError({
          statusCode: 400,
          message: `No action parameter or action ${action} not supported`,
        });
      }
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
