import { firestore } from 'firebase-admin';
export const getTimeStamp = () => {
    return firestore.FieldValue.serverTimestamp();
};

/**
 * convert JavaScript objects with custom prototypes to a plain object. 
 * @param obj 
 */
export const serializeObj = (obj: any) => JSON.parse(JSON.stringify(obj));
