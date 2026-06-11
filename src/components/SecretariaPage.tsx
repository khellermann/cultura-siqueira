import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import culturaLogoStacked from "@/assets/cultura-logo-stacked.png";

type SecretariaCard = {
  icon: LucideIcon;
  title: string;
  text: string;
  color: string;
};

type SecretariaPageProps = {
  accentColor: string;
  cards: SecretariaCard[];
  children?: ReactNode;
  description: string;
  eyebrow: string;
  heroContent?: ReactNode;
  heroVisual?: ReactNode;
  icon: LucideIcon;
  title: string;
};

export function SecretariaPage({
  accentColor,
  cards,
  children,
  description,
  eyebrow,
  heroContent,
  heroVisual,
  icon: Icon,
  title,
}: SecretariaPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#24223A]">
      <section className="relative min-h-[76vh] overflow-hidden bg-white">
        <SiteHeader />
        <div className="absolute inset-x-0 bottom-0 grid h-3 grid-cols-5">
          <div className="bg-[#414296]" />
          <div className="bg-[#00A859]" />
          <div className="bg-[#F7A600]" />
          <div className="bg-[#EF1B2D]" />
          <div className="bg-[#0B86D8]" />
        </div>

        <div className="mx-auto grid min-h-[76vh] max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:grid-cols-12 md:px-10 md:pt-36">
          {heroContent ?? (
            <>
              <div className="md:col-span-7">
                <p
                  className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
                  style={{ color: accentColor }}
                >
                  <Icon className="h-4 w-4" />
                  {eyebrow}
                </p>
                <h1 className="max-w-4xl font-sans text-5xl font-black leading-[0.98] tracking-normal text-[#414296] md:text-7xl">
                  {title}
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#4B4A5F] md:text-xl">
                  {description}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#00A859]"
                  >
                    Voltar para Home
                  </Link>
                  <Link
                    to="/eventos"
                    className="inline-flex items-center justify-center border-2 border-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#414296] transition hover:border-[#00A859] hover:text-[#00A859]"
                  >
                    Ver eventos
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5">
                {heroVisual ?? (
                  <div
                    className="relative mx-auto max-w-[28rem] border-2 bg-white p-8 shadow-[0_24px_70px_rgba(65,66,150,0.12)]"
                    style={{ borderColor: accentColor } as CSSProperties}
                  >
                    <img
                      src={culturaLogoStacked}
                      alt="Marca da Secretaria Municipal de Cultura"
                      className="w-full object-contain"
                      width={1800}
                      height={1500}
                    />
                    <div
                      className="absolute -bottom-5 -right-5 flex h-20 w-20 items-center justify-center text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Icon className="h-9 w-9" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-b border-[#E7E7EF] bg-[#F8F8FB]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] md:col-span-3"
            style={{ color: accentColor }}
          >
            — Serviços
          </p>
          <div className="md:col-span-9">
            <h2 className="max-w-4xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-5xl">
              Informação clara, acesso simples e ações culturais reunidas em um só lugar.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#4B4A5F]">
              Esta página segue a identidade da Secretaria para organizar serviços, programação e
              atividades de forma direta para a comunidade.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00A859]">
              — Destaques
            </p>
            <h2 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296] md:text-5xl">
              O que você encontra aqui
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const CardIcon = card.icon;

              return (
                <article
                  key={card.title}
                  className="min-h-[17rem] border-2 border-[#E7E7EF] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--card-color)] hover:shadow-[0_18px_40px_rgba(65,66,150,0.14)]"
                  style={{ "--card-color": card.color } as CSSProperties}
                >
                  <CardIcon className="h-7 w-7 text-[var(--card-color)]" />
                  <h3 className="mt-12 font-sans text-3xl font-black leading-tight tracking-normal text-[#24223A]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#414296] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3 md:px-10 md:py-24">
          {cards.map((card, index) => (
            <div key={card.title} className="border-t border-white/30 pt-6">
              <p className="text-3xl font-black" style={{ color: card.color }}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 font-sans text-2xl font-black tracking-normal">{card.title}</h3>
              <p className="mt-3 text-white/75">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {children}

      <SiteFooter />
    </div>
  );
}
