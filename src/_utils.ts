import { firestore } from 'firebase-admin';
export const getTimeStamp = () => {
    return firestore.FieldValue.serverTimestamp();
};