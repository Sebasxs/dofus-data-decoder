import admin from 'firebase-admin';
const { credential, database } = admin;
import { initializeApp } from 'firebase-admin/app';
import serviceAccount from '../data/serviceAccountKey.json' assert { type: 'json'};

initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: 'https://sei-points-41bc7.firebaseio.com'
});

export default (path) => database().ref(path);