import "./lib/error-capture";

import type { HandleUploadBody } from "@vercel/blob/client";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { museumGalleryItems } from "./lib/museumCatalog";
import { readPublicEvents } from "./lib/publicEvents.server";
import { getEventSlug, getMuseumItemSlug, siteUrl } from "./lib/seo";
import { culturalStories } from "./lib/stories";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const publicPaths = [
  "/",
  "/museu",
  "/acervo",
  "/sobre",
  "/visite",
  "/contribua",
  "/biblioteca",
  "/casa-da-cultura",
  "/eventos",
  "/editais",
  "/inscricoes",
  "/historias",
];

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSitemapEntry(path: string, lastmod: string, image?: string) {
  const imageXml = image
    ? `<image:image><image:loc>${xmlEscape(new URL(image, siteUrl).toString())}</image:loc></image:image>`
    : "";
  return `<url><loc>${xmlEscape(new URL(path, siteUrl).toString())}</loc><lastmod>${lastmod}</lastmod>${imageXml}</url>`;
}

async function createSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  let events = [];
  try {
    events = await readPublicEvents();
  } catch (error) {
    console.error("Could not add Firebase events to sitemap", error);
  }

  const entries = [
    ...publicPaths.map((path) => createSitemapEntry(path, today)),
    ...museumGalleryItems.map((item) =>
      createSitemapEntry(`/acervo/${getMuseumItemSlug(item)}`, today, item.image),
    ),
    ...culturalStories.map((story) =>
      createSitemapEntry(`/historias/${story.slug}`, story.publishedAt, story.image),
    ),
    ...events.map((event) =>
      createSitemapEntry(`/eventos/${getEventSlug(event)}`, event.date, event.flyerUrl),
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>`;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleBlobUpload(request: Request) {
  try {
    const [{ handleUpload }, { verifyFirebaseAdminToken }] = await Promise.all([
      import("@vercel/blob/client"),
      import("./lib/firebaseAdmin.server"),
    ]);
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const parsedPayload = JSON.parse(clientPayload ?? "{}") as {
          idToken?: unknown;
          kind?: unknown;
        };
        if (typeof parsedPayload.idToken !== "string" || !parsedPayload.idToken) {
          throw new Error("Token de autenticacao ausente.");
        }
        if (parsedPayload.kind !== "event-image" && parsedPayload.kind !== "public-document") {
          throw new Error("Tipo de upload invalido.");
        }
        const payload = {
          idToken: parsedPayload.idToken,
          kind: parsedPayload.kind,
        };
        await verifyFirebaseAdminToken(payload.idToken);

        const expectedPrefix = payload.kind === "event-image" ? "eventos/" : "editais/";
        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Destino de upload invalido.");
        }

        return {
          allowedContentTypes:
            payload.kind === "event-image"
              ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
              : ["application/pdf"],
          maximumSizeInBytes: payload.kind === "event-image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 31_536_000,
          tokenPayload: JSON.stringify({ admin: true, kind: payload.kind }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return Response.json(response);
  } catch (error) {
    console.error("Blob upload authorization failed", error);
    const message = error instanceof Error ? error.message : "Nao foi possivel autorizar o upload.";
    return Response.json({ error: message }, { status: 400 });
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const officialHost = new URL(siteUrl).hostname;
      const isOfficialHost = url.hostname === officialHost;
      const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);

      if (url.pathname === "/api/blob-upload" && request.method === "POST") {
        return handleBlobUpload(request);
      }

      if (url.pathname === "/robots.txt") {
        const body = isOfficialHost
          ? `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`
          : "User-agent: *\nDisallow: /\n";
        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      if (url.pathname === "/sitemap.xml") {
        if (!isOfficialHost && !isLocalHost) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(await createSitemap(), {
          headers: {
            "cache-control": "public, max-age=900, s-maxage=3600",
            "content-type": "application/xml; charset=utf-8",
          },
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      const headers = new Headers(normalizedResponse.headers);
      if ((!isOfficialHost && !isLocalHost) || url.pathname.startsWith("/admin")) {
        headers.set("x-robots-tag", "noindex, nofollow");
      }
      return new Response(normalizedResponse.body, {
        status: normalizedResponse.status,
        statusText: normalizedResponse.statusText,
        headers,
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
