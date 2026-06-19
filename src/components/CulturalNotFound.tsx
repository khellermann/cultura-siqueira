import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Brush, Clapperboard, Landmark, Music2, Theater } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const culturalIcons = [
  { icon: Theater, label: "Teatro", className: "left-[8%] top-[18%] text-[#F7A600]" },
  { icon: Music2, label: "Musica", className: "right-[9%] top-[22%] text-[#0B86D8]" },
  { icon: BookOpen, label: "Livro", className: "left-[13%] bottom-[18%] text-[#00A859]" },
  { icon: Brush, label: "Arte", className: "right-[15%] bottom-[20%] text-[#EF1B2D]" },
  { icon: Landmark, label: "Museu", className: "left-[48%] top-[10%] text-[#414296]" },
  { icon: Clapperboard, label: "Bastidores", className: "right-[46%] bottom-[10%] text-[#7B3F24]" },
] as const;

export function CulturalNotFound() {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const curtains = root.querySelectorAll<HTMLElement>("[data-curtain]");
    const numbers = root.querySelectorAll<HTMLElement>("[data-number]");
    const copies = root.querySelectorAll<HTMLElement>("[data-copy]");
    const floatingIcons = root.querySelectorAll<HTMLElement>("[data-float]");

    curtains.forEach((curtain) => {
      curtain.style.animationName = "none";
    });
    void root.offsetWidth;
    curtains.forEach((curtain) => {
      curtain.style.removeProperty("animation-name");
    });

    const ctx = gsap.context(() => {
      gsap.killTweensOf([...numbers, ...copies, ...floatingIcons]);
      gsap.set(numbers, { opacity: 0, y: 46, scale: 0.84, rotate: -2 });
      gsap.set(copies, { opacity: 0, y: 24 });
      gsap.set(floatingIcons, { opacity: 0, y: 20, rotate: -8, scale: 0.92 });

      const timeline = gsap.timeline({
        delay: 1.62,
        defaults: { ease: "power4.inOut" },
      });

      timeline
        .fromTo(
          numbers,
          { y: 46, opacity: 0, scale: 0.84, rotate: -2 },
          { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.8 },
          0,
        )
        .fromTo(
          copies,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
          "-=0.28",
        )
        .fromTo(
          floatingIcons,
          { y: 20, opacity: 0, rotate: -8, scale: 0.92 },
          { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 0.72, stagger: 0.08 },
          "-=0.42",
        );

      gsap.to(floatingIcons, {
        y: (index) => (index % 2 === 0 ? -16 : 16),
        x: (index) => (index % 3 === 0 ? 8 : -8),
        rotate: (index) => (index % 2 === 0 ? 5 : -5),
        duration: (index) => 2.8 + index * 0.18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.1,
      });
    }, root);

    return () => ctx.revert();
  }, [pathname]);

  function animateButton(direction: "in" | "out") {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      duration: 0.28,
      scale: direction === "in" ? 1.04 : 1,
      y: direction === "in" ? -2 : 0,
      ease: "power2.out",
    });
  }

  return (
    <main
      ref={rootRef}
      data-disable-scroll-reveal
      className="relative isolate flex min-h-screen overflow-hidden bg-[#FFF7EB] text-[#24223A]"
    >
      <div
        data-curtain="left"
        aria-hidden="true"
        className="not-found-curtain not-found-curtain-left absolute inset-y-0 left-0 z-20 w-1/2 transform-gpu will-change-transform bg-[repeating-linear-gradient(90deg,#8B1E24_0,#8B1E24_26px,#A8282E_26px,#A8282E_52px)] shadow-[inset_-22px_0_36px_rgba(0,0,0,0.24)]"
      />
      <div
        data-curtain="right"
        aria-hidden="true"
        className="not-found-curtain not-found-curtain-right absolute inset-y-0 right-0 z-20 w-1/2 transform-gpu will-change-transform bg-[repeating-linear-gradient(90deg,#A8282E_0,#A8282E_26px,#8B1E24_26px,#8B1E24_52px)] shadow-[inset_22px_0_36px_rgba(0,0,0,0.24)]"
      />

      <div className="absolute inset-x-0 top-0 h-6 bg-[#7B1C22]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[#414296]" aria-hidden="true" />

      {culturalIcons.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            data-float
            data-animated
            aria-hidden="true"
            className={[
              "pointer-events-none absolute hidden rounded-full border border-black/10 bg-white/75 p-4 opacity-0 shadow-[0_18px_45px_rgba(65,66,150,0.14)] backdrop-blur sm:block",
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
          data-animated
          className="mb-6 inline-flex items-center gap-3 border border-[#414296]/20 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#414296] opacity-0 shadow-sm"
        >
          <Theater className="h-4 w-4 text-[#EF1B2D]" />
          Secretaria Municipal de Cultura
        </p>

        <h1
          data-number
          data-animated
          className="font-sans text-[7rem] font-black leading-none tracking-normal text-[#414296] opacity-0 sm:text-[10rem] md:text-[13rem]"
        >
          404
        </h1>

        <div data-copy data-animated className="mx-auto mt-4 max-w-3xl opacity-0">
          <h2 className="font-sans text-4xl font-black leading-tight tracking-normal md:text-6xl">
            A página saiu de cena
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#5F5D70] md:text-xl">
            Procuramos nos bastidores, na biblioteca, no museu e até no camarim... mas esse conteúdo
            resolveu fazer uma turnê.
          </p>
        </div>

        <div
          data-copy
          data-animated
          className="mt-10 grid w-full max-w-2xl gap-3 text-left text-sm text-[#5F5D70] opacity-0 sm:grid-cols-3"
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
          data-copy
          data-animated
          to="/"
          onMouseEnter={() => animateButton("in")}
          onMouseLeave={() => animateButton("out")}
          className="mt-10 inline-flex items-center justify-center bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white opacity-0 shadow-[0_18px_35px_rgba(65,66,150,0.24)] transition-colors hover:bg-[#00A859] focus:outline-none focus:ring-4 focus:ring-[#F7A600]/45"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
