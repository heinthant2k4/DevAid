import "dotenv/config"
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import admin from "firebase-admin";

/**
 * This script migrates donation data from a Google Sheet to Firestore.
 * It reads the data from the specified Google Sheet and writes it to the Firestore database.
 * It also logs any errors that occur during the migration process.
 * Run chin yin "npx tsx scripts/migrateDonations.ts" to execute the script.
 * Make sure to set the required environment variables before running the script.
 */

// --- Firestore Setup ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// --- Google Sheets Auth ---
const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
/**
 * Sheet1 is the tab name 

A2:C25 means:

    Start at cell A2

    End at C25

    Covers all 24 rows of donation data
 */
const RANGE = "Sheet1!A2:C25"; 

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
      const [name,amount, date] = row;

      if (!name || !amount) continue; // Skip incomplete rows

      await db.collection("donations").add({
        name,
        amount: parseFloat(amount),
        date: date ? String(date): ""
      });

      console.log(`✅ Migrated: ${name} - MMK${amount}`);
    }

    console.log(" Migration completedly.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

migrateDonations();
