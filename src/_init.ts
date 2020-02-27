import * as admin from 'firebase-admin';
import config from './config';

admin.initializeApp({
    credential: admin.credential.cert(config as any),
    databaseURL: `https://${config.project_id}.firebaseio.com`,
});
