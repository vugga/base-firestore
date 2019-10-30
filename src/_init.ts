import * as admin from 'firebase-admin';
import config from './config';

const { projectId } = config;

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: `https://${projectId}.firebaseio.com`
});

const db = admin.firestore();
// const storage = admin.storage();
// const firebaseAuth = admin.auth;

export { db };
