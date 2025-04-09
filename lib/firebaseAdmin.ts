import admin from "firebase-admin";

/**
 * Firebase Admin SDK setup
 * This script initializes the Firebase Admin SDK for server-side operations.
 * It uses environment variables to configure the SDK.
 * Make sure to set the required environment variables before running the script.
 */

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
export default db;
