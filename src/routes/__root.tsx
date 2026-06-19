import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { CulturalNotFound } from "@/components/CulturalNotFound";
import { absoluteUrl, organizationJsonLd, socialImages } from "@/lib/seo";
import appCss from "../styles.css?url";

function ScrollReveal() {
  useEffect(() => {
    const selector = [
      "main section",
      "main article",
      "section > div > article",
      "section > div > div > article",
      "[data-scroll-reveal]",
    ].join(", ");

    const prepareElements = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
        (element) =>
          !element.closest("[role='dialog']") &&
          !element.closest("header") &&
          !element.closest("footer") &&
          !element.closest("[data-disable-scroll-reveal]") &&
          !element.classList.contains("scroll-reveal"),
      );

      elements.forEach((element, index) => {
        element.classList.add("scroll-reveal", index % 2 === 0 ? "scroll-reveal-left" : "scroll-reveal-right");
      });
      return elements;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    const observe = () => prepareElements().forEach((element) => observer.observe(element));
    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}

function AnalyticsTracker() {
  useEffect(() => {
    function track(name: string, params: Record<string, string> = {}) {
      const analyticsWindow = window as typeof window & {
        gtag?: (...args: unknown[]) => void;
      };
      analyticsWindow.gtag?.("event", name, params);
    }

    function handleClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("contact_phone_click", { link_url: href });
      else if (href.startsWith("mailto:")) track("contact_email_click", { link_url: href });
      else if (/google\.[^/]+\/maps|maps\.app\.goo\.gl/i.test(href)) {
        track("map_click", { link_url: href });
      } else if (/\.pdf(?:$|\?)/i.test(href)) {
        track("document_open", { link_url: href });
      } else if (/inscri|register|form/i.test(href)) {
        track("registration_link_click", { link_url: href });
      }
    }

    function handleSubmit() {
      if (window.location.pathname === "/visite") track("visit_request_submit");
      if (window.location.pathname === "/inscricoes") track("registration_submit");
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return null;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("Root route error boundary", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const googleSiteVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    return {
      meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Secretaria Municipal de Cultura de Siqueira Campos" },
      {
        name: "description",
        content: "Portal da Secretaria Municipal de Cultura de Siqueira Campos — PR.",
      },
      { property: "og:title", content: "Secretaria Municipal de Cultura de Siqueira Campos" },
      {
        property: "og:description",
        content: "Museu, biblioteca, Casa da Cultura, inscrições e eventos culturais do município.",
      },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Secretaria Municipal de Cultura de Siqueira Campos" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: absoluteUrl(socialImages.home.src) },
      { property: "og:image:secure_url", content: absoluteUrl(socialImages.home.src) },
      { property: "og:image:type", content: socialImages.home.type },
      { property: "og:image:width", content: String(socialImages.home.width) },
      { property: "og:image:height", content: String(socialImages.home.height) },
      { property: "og:image:alt", content: socialImages.home.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Secretaria Municipal de Cultura de Siqueira Campos" },
      {
        name: "twitter:description",
        content: "Museu, biblioteca, Casa da Cultura, inscrições e eventos culturais do município.",
      },
      { name: "twitter:image", content: absoluteUrl(socialImages.home.src) },
      { name: "twitter:image:alt", content: socialImages.home.alt },
      ...(googleSiteVerification
        ? [{ name: "google-site-verification", content: googleSiteVerification }]
        : []),
      ],
      links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(organizationJsonLd),
        },
        ...(gaMeasurementId
          ? [
              {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
              },
              {
                children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaMeasurementId}',{anonymize_ip:true});`,
              },
            ]
          : []),
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: CulturalNotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollReveal />
      <AnalyticsTracker />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
