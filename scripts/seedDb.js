// To be used from the CLI or package.json script, and only once.

const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const sites = require('./sites.json');

const seed = async () => {
  try {
    dotenv.config({ path: '.env.local' });
    const { MONGODB_URI, MONGODB_DB } = process.env;
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const client = await MongoClient.connect(MONGODB_URI, opts);
    const db = client.db(MONGODB_DB);

    const foundSite = await db.collection('sites').findOne();

    if (foundSite !== null) {
      throw new Error('Sites collection already exists');
    }

    const sitesWithFields = sites.map(site => ({
      siteId: site.id,
      name: site.name,
      idseq: 1,
      members: [],
    }));

    await db.collection('sites').insertMany(sitesWithFields);
    console.log('Success!');
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seed();
