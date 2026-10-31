require('dotenv').config();
const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/loginaft_db';
const ATLAS_URI = process.env.MONGO_URI || 'mongodb+srv://hakimaitabderrahim18_db_user:df442tPjfKwJheUs@cluster0.bv7djak.mongodb.net/loginaft_db?retryWrites=true&w=majority';

async function migrateData() {
  console.log('================================================================');
  console.log('  🇩🇿 Migrating ALL Local Data & Seeds to MongoDB Atlas...');
  console.log('================================================================');
  console.log(`Source (Local) : ${LOCAL_URI}`);
  console.log(`Target (Atlas) : ${ATLAS_URI.replace(/:([^:@]+)@/, ':****@')}\n`);

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    await localClient.connect();
    console.log('✅ Connected to Local MongoDB.');

    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas.\n');

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to synchronize:\n`);

    let totalSynced = 0;

    for (const collInfo of collections) {
      const collName = collInfo.name;
      if (collName.startsWith('system.')) continue;

      const localColl = localDb.collection(collName);
      const atlasColl = atlasDb.collection(collName);

      const docs = await localColl.find({}).toArray();
      if (docs.length === 0) {
        console.log(`  ⚪ ${collName.padEnd(18)} : 0 documents (skipped)`);
        continue;
      }

      // Clean target collection on Atlas to preserve exact local _id references & relationships
      await atlasColl.deleteMany({});
      await atlasColl.insertMany(docs);

      totalSynced += docs.length;
      console.log(`  🟢 ${collName.padEnd(18)} : ${docs.length} documents copied to Atlas`);
    }

    console.log('\n================================================================');
    console.log(`  🎉 SUCCESS! Total ${totalSynced} documents synchronized to MongoDB Atlas.`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrateData();
