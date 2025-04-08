import "dotenv/config";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";

/**
 * This script migrates donation data from a Google Sheet to Firestore.
 * It reads the data from the specified Google Sheet and writes it to the Firestore database.
 * It also logs any errors that occur during the migration process.
 * Run chin yin "npx tsx scripts/migrateDonations.ts" to execute the script.
 * Make sure to set the required environment variables before running the script.
 */

// --- Firebase Client SDK Setup ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase app (ensure it's not initialized multiple times)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

// --- Google Sheets Auth ---
const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RANGE = "Sheet1!A2:C"; // Adjust the range as needed

async function migrateDonations() {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet.");
      return;
    }

    for (const row of rows) {
      const [name, amount] = row;

      if (!name || !amount) continue; // Skip incomplete rows

      // Create a composite key
      const compositeKey = `${name}_MMK${amount}`;

      // Check if the record already exists in Firestore
      const donationsRef = collection(db, "donations");
      const existingDocsQuery = query(donationsRef, where("compositeKey", "==", compositeKey));
      const existingDocs = await getDocs(existingDocsQuery);

      if (!existingDocs.empty) {
        console.log(`⚠️ Skipping duplicate: ${name} - MMK${amount}`);
        continue; // Skip this record if it already exists
      }

      // Add the record to Firestore
      await addDoc(donationsRef, {
        compositeKey, // Store the composite key
        name,
        amount: parseFloat(amount),
      });

      console.log(`✅ Migrated: ${name} - MMK${amount}`);
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

migrateDonations();
