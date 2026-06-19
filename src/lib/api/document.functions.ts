import { upload } from "@vercel/blob/client";

import { firebaseAuth } from "@/lib/firebase";

function sanitizeFileName(fileName: string) {
  const cleanName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const extensionMatch = cleanName.match(/(\.[a-zA-Z0-9]+)$/);
  const extension = extensionMatch?.[1] ?? "";
  const baseName = (extension ? cleanName.slice(0, -extension.length) : cleanName).slice(0, 48);

  return `${baseName || "documento"}${extension}`;
}

export async function uploadPublicDocument(file: File) {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error("Entre novamente no painel para enviar o arquivo.");

  const idToken = await user.getIdToken();
  const originalName = sanitizeFileName(file.name);
  const fileName = `${Date.now()}-${/\.pdf$/i.test(originalName) ? originalName : `${originalName}.pdf`}`;
  const blob = await upload(`editais/${fileName}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
    clientPayload: JSON.stringify({ idToken, kind: "public-document" }),
    contentType: "application/pdf",
  });

  return {
    path: blob.pathname,
    url: blob.url,
  };
}
