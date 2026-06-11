import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uploadEventFlyerInput = z.object({
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

  return `${baseName || "flyer"}${extension}`;
}

export const uploadEventFlyer = createServerFn({ method: "POST" })
  .inputValidator(uploadEventFlyerInput)
  .handler(async ({ data }) => {
    const [{ mkdir, writeFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const match = data.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

    if (!match) {
      throw new Error("Arquivo de flyer invalido.");
    }

    const [, mimeType, base64] = match;
    const extensionByMime: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const originalName = sanitizeFileName(data.fileName);
    const fallbackExtension = extensionByMime[mimeType] ?? ".png";
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(originalName);
    const fileName = `${Date.now()}-${hasExtension ? originalName : `${originalName}${fallbackExtension}`}`;
    const publicDir = path.join(process.cwd(), "public", "eventos");
    const absolutePath = path.join(publicDir, fileName);

    await mkdir(publicDir, { recursive: true });
    await writeFile(absolutePath, Buffer.from(base64, "base64"));

    return {
      path: `/eventos/${fileName}`,
    };
  });
