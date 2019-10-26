import * as firebase from 'firebase';
import 'firebase/firestore';
import config from './config';

firebase.initializeApp(config);
const db = firebase.firestore();

export { db };
