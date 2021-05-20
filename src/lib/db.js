import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const mongoDatabase = process.env.MONGODB_DB;

if (!mongoUri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

if (!mongoDatabase) {
  throw new Error(
    'Please define the MONGODB_DB environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  global.mongo = { conn: null, promise: null };
  cached = global.mongo;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const conn = {};
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = MongoClient.connect(mongoUri, opts)
      .then(client => {
        conn.client = client;
        return client.db(mongoDatabase);
      })
      .then(db => {
        db.collection('users').createIndex({ email: 1 }, { unique: true });
        db.collection('auth_tokens').createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: 172800 }
        );
        db.collection('reset_tokens').createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: 172800 }
        );
        conn.db = db;
        return conn;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
