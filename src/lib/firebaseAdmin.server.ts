import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountSecret = {
  client_email: string;
  private_key: string;
  project_id: string;
};

function parseServiceAccount(value: string): ServiceAccountSecret {
  const parsed = JSON.parse(value) as Partial<ServiceAccountSecret>;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is incomplete.");
  }

  return {
    project_id: parsed.project_id,
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function getFirebaseAdminApp() {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = parseServiceAccount(serviceAccountJson);
    return initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
      projectId: serviceAccount.project_id,
    });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId) {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  return null;
}

export function getFirebaseAdminDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}
