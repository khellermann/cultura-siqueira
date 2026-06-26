type FirebaseLookupResponse = {
  users?: Array<{
    email?: string;
  }>;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} nao configurado.`);
  return value;
}

function getAdminEmails() {
  return new Set(
    (process.env.VITE_FIREBASE_ADMIN_EMAILS ?? "khellermann@gmail.com")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function getSignedInEmail(idToken: string) {
  const apiKey = getRequiredEnv("VITE_FIREBASE_API_KEY");
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    throw new Error("Token Firebase invalido ou expirado.");
  }

  const payload = (await response.json()) as FirebaseLookupResponse;
  const email = payload.users?.[0]?.email?.trim().toLowerCase();
  if (!email) throw new Error("Usuario sem e-mail autenticado.");

  return email;
}

async function adminDocumentExists(email: string, idToken: string) {
  const apiKey = getRequiredEnv("VITE_FIREBASE_API_KEY");
  const projectId = getRequiredEnv("VITE_FIREBASE_PROJECT_ID");
  const encodedEmail = encodeURIComponent(email);
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin_users/${encodedEmail}?key=${encodeURIComponent(apiKey)}`,
    {
      headers: {
        authorization: `Bearer ${idToken}`,
      },
    },
  );

  return response.ok;
}

export async function verifyFirebaseAdminToken(idToken: string) {
  const email = await getSignedInEmail(idToken);
  if (getAdminEmails().has(email)) return email;

  if (await adminDocumentExists(email, idToken)) return email;

  throw new Error("Usuario sem permissao administrativa.");
}
