import { Link } from "@tanstack/react-router";
import { BookOpen, Brush, Clapperboard, Landmark, Music2, Theater } from "lucide-react";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gsap?: {
      fromTo: (
        targets: unknown,
        fromVars: Record<string, unknown>,
        toVars: Record<string, unknown>,
      ) => unknown;
      to: (targets: unknown, vars: Record<string, unknown>) => unknown;
      timeline: (vars?: Record<string, unknown>) => {
        fromTo: (
          targets: unknown,
          fromVars: Record<string, unknown>,
          toVars: Record<string, unknown>,
          position?: string | number,
        ) => ReturnType<Window["gsap"]["timeline"]>;
        to: (
          targets: unknown,
          vars: Record<string, unknown>,
          position?: string | number,
        ) => ReturnType<Window["gsap"]["timeline"]>;
      };
    };
  }
}

const culturalIcons = [
  { icon: Theater, label: "Teatro", className: "left-[8%] top-[18%] text-[#F7A600]" },
  { icon: Music2, label: "Música", className: "right-[9%] top-[22%] text-[#0B86D8]" },
  { icon: BookOpen, label: "Livro", className: "left-[13%] bottom-[18%] text-[#00A859]" },
  { icon: Brush, label: "Arte", className: "right-[15%] bottom-[20%] text-[#EF1B2D]" },
  { icon: Landmark, label: "Museu", className: "left-[48%] top-[10%] text-[#414296]" },
  { icon: Clapperboard, label: "Bastidores", className: "right-[46%] bottom-[10%] text-[#7B3F24]" },
] as const;

function loadGsap() {
  if (window.gsap) return Promise.resolve(window.gsap);

  return new Promise<NonNullable<Window["gsap"]>>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-gsap]");
    if (existingScript) {
      existingScript.addEventListener("load", () => window.gsap && resolve(window.gsap));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    script.async = true;
    script.dataset.gsap = "true";
    script.onload = () => (window.gsap ? resolve(window.gsap) : reject());
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function CulturalNotFound() {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let cancelled = false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    loadGsap()
      .then((gsap) => {
        if (cancelled || !rootRef.current) return;

        const root = rootRef.current;
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

        timeline
          .to(root.querySelectorAll("[data-curtain]"), {
            duration: 1.3,
            scaleX: 0.18,
            stagger: 0.08,
            transformOrigin: (index: number) => (index === 0 ? "left center" : "right center"),
          })
          .fromTo(
            root.querySelector("[data-number]"),
            { y: 38, opacity: 0, scale: 0.86 },
            { y: 0, opacity: 1, scale: 1, duration: 0.75 },
            "-=0.65",
          )
          .fromTo(
            root.querySelectorAll("[data-copy]"),
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
            "-=0.25",
          )
          .fromTo(
            root.querySelectorAll("[data-float]"),
            { y: 18, opacity: 0, rotate: -8 },
            { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.08 },
            "-=0.45",
          );

        root.querySelectorAll("[data-float]").forEach((element, index) => {
          gsap.to(element, {
            y: index % 2 === 0 ? -16 : 16,
            x: index % 3 === 0 ? 8 : -8,
            rotate: index % 2 === 0 ? 5 : -5,
            duration: 2.8 + index * 0.18,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      })
      .catch(() => {
        rootRef.current?.classList.add("gsap-fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function animateButton(direction: "in" | "out") {
    if (!window.gsap || !buttonRef.current) return;
    window.gsap.to(buttonRef.current, {
      duration: 0.28,
      scale: direction === "in" ? 1.04 : 1,
      y: direction === "in" ? -2 : 0,
      ease: "power2.out",
    });
  }

  return (
    <main
      ref={rootRef}
      className="relative isolate flex min-h-screen overflow-hidden bg-[#FFF7EB] text-[#24223A]"
    >
      <div
        data-curtain
        className="absolute inset-y-0 left-0 z-20 w-1/2 origin-left bg-[repeating-linear-gradient(90deg,#8B1E24_0,#8B1E24_26px,#A8282E_26px,#A8282E_52px)] shadow-[inset_-22px_0_36px_rgba(0,0,0,0.24)]"
      />
      <div
        data-curtain
        className="absolute inset-y-0 right-0 z-20 w-1/2 origin-right bg-[repeating-linear-gradient(90deg,#A8282E_0,#A8282E_26px,#8B1E24_26px,#8B1E24_52px)] shadow-[inset_22px_0_36px_rgba(0,0,0,0.24)]"
      />

      <div className="absolute inset-x-0 top-0 h-6 bg-[#7B1C22]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[#414296]" aria-hidden="true" />

      {culturalIcons.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            data-float
            aria-hidden="true"
            className={[
              "pointer-events-none absolute hidden rounded-full border border-black/10 bg-white/75 p-4 shadow-[0_18px_45px_rgba(65,66,150,0.14)] backdrop-blur sm:block",
              item.className,
            ].join(" ")}
          >
            <Icon className="h-8 w-8" />
          </div>
        );
      })}

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center md:px-10">
        <p
          data-copy
          className="mb-6 inline-flex items-center gap-3 border border-[#414296]/20 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#414296] shadow-sm"
        >
          <Theater className="h-4 w-4 text-[#EF1B2D]" />
          Secretaria Municipal de Cultura
        </p>

        <h1
          data-number
          className="font-sans text-[7rem] font-black leading-none tracking-normal text-[#414296] sm:text-[10rem] md:text-[13rem]"
        >
          404
        </h1>

        <div data-copy className="mx-auto mt-4 max-w-3xl">
          <h2 className="font-sans text-4xl font-black leading-tight tracking-normal md:text-6xl">
            A página saiu de cena
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#5F5D70] md:text-xl">
            Procuramos nos bastidores, na biblioteca, no museu e até no camarim... mas esse
            conteúdo resolveu fazer uma turnê.
          </p>
        </div>

        <div
          data-copy
          className="mt-10 grid w-full max-w-2xl gap-3 text-left text-sm text-[#5F5D70] sm:grid-cols-3"
        >
          <div className="border border-[#E5D8C8] bg-white/70 p-4">
            <p className="font-semibold text-[#414296]">No palco</p>
            <p className="mt-1">A cortina abriu, mas a rota não entrou.</p>
          </div>
          <div className="border border-[#E5D8C8] bg-white/70 p-4">
            <p className="font-semibold text-[#414296]">Na biblioteca</p>
            <p className="mt-1">Nem o índice encontrou esse capítulo.</p>
          </div>
          <div className="border border-[#E5D8C8] bg-white/70 p-4">
            <p className="font-semibold text-[#414296]">No museu</p>
            <p className="mt-1">Virou peça rara: ninguém sabe onde está.</p>
          </div>
        </div>

        <Link
          ref={buttonRef}
          to="/"
          onMouseEnter={() => animateButton("in")}
          onMouseLeave={() => animateButton("out")}
          className="mt-10 inline-flex items-center justify-center bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_35px_rgba(65,66,150,0.24)] transition-colors hover:bg-[#00A859] focus:outline-none focus:ring-4 focus:ring-[#F7A600]/45"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
