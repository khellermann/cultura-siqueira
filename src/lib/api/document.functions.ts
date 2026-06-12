import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uploadPublicDocumentInput = z.object({
  dataUrl: z.string().min(1),
  fileName: z.string().min(1),
});

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

export const uploadPublicDocument = createServerFn({ method: "POST" })
  .inputValidator(uploadPublicDocumentInput)
  .handler(async ({ data }) => {
    const [{ mkdir, writeFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const match = data.dataUrl.match(/^data:(application\/pdf);base64,(.+)$/);

    if (!match) {
      throw new Error("Documento invalido. Envie um PDF.");
    }

    const [, , base64] = match;
    const originalName = sanitizeFileName(data.fileName);
    const hasExtension = /\.pdf$/i.test(originalName);
    const fileName = `${Date.now()}-${hasExtension ? originalName : `${originalName}.pdf`}`;
    const publicDir = path.join(process.cwd(), "public", "editais");
    const absolutePath = path.join(publicDir, fileName);

    await mkdir(publicDir, { recursive: true });
    await writeFile(absolutePath, Buffer.from(base64, "base64"));

    return {
      path: `/editais/${fileName}`,
    };
  });
