import * as admin from 'firebase-admin';
import config from './config';

admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(config),
    databaseURL: `https://${config.project_id}.firebaseio.com`,
});

const db = admin.firestore();
const realTimeDb = admin.database();
export { db, realTimeDb };
