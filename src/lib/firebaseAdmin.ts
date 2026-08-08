import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load Firebase Config
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    firebaseConfig = JSON.parse(raw);
  }
} catch (err) {
  console.warn('[FirebaseAdmin] Warning: Could not read firebase-applet-config.json:', err);
}

const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'gen-lang-client-0269127201';
const databaseId = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';

if (getApps().length === 0) {
  try {
    initializeApp({
      projectId,
    });
    console.log(`[FirebaseAdmin] Initialized for project: ${projectId}`);
  } catch (initErr) {
    console.error('[FirebaseAdmin] Error initializing Firebase Admin SDK:', initErr);
  }
}

const adminApp = getApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp, databaseId);
