import { Link } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import culturaLogo from "@/assets/cultura-logo-horizontal.png";
import museuLogo from "@/assets/museu-logo.png";
import { firebaseDb } from "@/lib/firebase";
import {
  defaultMenuVisibility,
  mergeMenuVisibility,
  museumMenuItems,
  navigationSettingsDocId,
  secretariaMenuItems,
  siteSettingsCollection,
} from "@/lib/siteSettings";

type MobileMenuVariant = "secretaria" | "museu";
type MenuItem = (typeof secretariaMenuItems)[number] | (typeof museumMenuItems)[number];

function useVisibleMenuItems(items: readonly MenuItem[]) {
  const [visibility, setVisibility] = useState(defaultMenuVisibility);

  useEffect(() => {
    let mounted = true;

    async function loadVisibility() {
      if (!firebaseDb) return;
      const snapshot = await getDoc(doc(firebaseDb, siteSettingsCollection, navigationSettingsDocId));
      if (!mounted || !snapshot.exists()) return;
      setVisibility(mergeMenuVisibility(snapshot.data().items as Record<string, unknown> | undefined));
    }

    loadVisibility().catch((error) => console.error(error));
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => items.filter((item) => visibility[item.path] !== false), [items, visibility]);
}

function MobileMenu({
  items,
  variant,
}: {
  items: readonly MenuItem[];
  variant: MobileMenuVariant;
}) {
  const [open, setOpen] = useState(false);
  const isSecretaria = variant === "secretaria";
  const visibleItems = useVisibleMenuItems(items);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={[
          "inline-flex h-11 w-11 items-center justify-center border transition md:hidden",
          isSecretaria
            ? "border-[#414296]/25 bg-white/80 text-[#414296] hover:border-[#00A859] hover:text-[#00A859]"
            : "border-border bg-background text-foreground hover:border-foreground",
        ].join(" ")}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={[
          "fixed inset-0 z-50 md:hidden",
          "transition-[opacity,transform] duration-500 ease-out",
          open ? "translate-y-0 opacity-100" : "-translate-y-5 pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div
          className={[
            "absolute inset-0",
            isSecretaria ? "bg-white" : "bg-background",
            open ? "scale-100" : "scale-[1.02]",
            "transition-transform duration-500 ease-out",
          ].join(" ")}
        />

        <div className="relative flex min-h-dvh flex-col px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              tabIndex={open ? undefined : -1}
              className="block"
              aria-label="Secretaria Municipal de Cultura"
            >
              {isSecretaria ? (
                <img
                  src={culturaLogo}
                  alt="Secretaria Municipal de Cultura de Siqueira Campos"
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <img
                  src={museuLogo}
                  alt="Museu Historico de Siqueira Campos"
                  className="h-12 w-auto object-contain"
                />
              )}
            </Link>

            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              tabIndex={open ? undefined : -1}
              className={[
                "inline-flex h-11 w-11 items-center justify-center border transition",
                isSecretaria
                  ? "border-[#414296]/25 text-[#414296] hover:border-[#EF1B2D] hover:text-[#EF1B2D]"
                  : "border-border text-foreground hover:border-foreground",
              ].join(" ")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-16 flex flex-1 flex-col justify-center gap-3 pb-16">
            {visibleItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                tabIndex={open ? undefined : -1}
                activeProps={{
                  className: isSecretaria ? "text-[#00A859]" : "text-accent",
                }}
                className={[
                  "group flex items-center justify-between border-b py-5 text-3xl uppercase leading-none tracking-wide transition",
                  "duration-500 ease-out",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  isSecretaria
                    ? "border-[#414296]/15 font-sans font-black text-[#414296] hover:text-[#00A859]"
                    : "border-border font-display text-foreground hover:text-accent",
                ].join(" ")}
                style={{ transitionDelay: open ? `${120 + index * 45}ms` : "0ms" }}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    "text-base transition group-hover:translate-x-1",
                    isSecretaria ? "text-[#F7A600]" : "text-accent",
                  ].join(" ")}
                >
                  -&gt;
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

function SecretariaNav({ absolute = false }: { absolute?: boolean }) {
  const visibleItems = useVisibleMenuItems(secretariaMenuItems);

  return (
    <header className={absolute ? "absolute top-0 left-0 right-0 z-20" : "border-b border-[#E7E7EF] bg-white"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="block" aria-label="Secretaria Municipal de Cultura">
          <img
            src={culturaLogo}
            alt="Secretaria Municipal de Cultura de Siqueira Campos"
            className="h-12 w-auto object-contain md:h-16"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] md:flex">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              activeProps={{ className: "text-[#00A859]" }}
              className="transition hover:text-[#00A859]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileMenu items={secretariaMenuItems} variant="secretaria" />
      </div>
    </header>
  );
}

export function SiteHeader() {
  return <SecretariaNav absolute />;
}

export function SecretariaHeader() {
  return <SecretariaNav />;
}

export function PageHeader({ menu = "secretaria" }: { menu?: MobileMenuVariant }) {
  const items = menu === "museu" ? museumMenuItems : secretariaMenuItems;
  const visibleItems = useVisibleMenuItems(items);
  const isMuseum = menu === "museu";

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          to={isMuseum ? "/museu" : "/"}
          className={isMuseum ? "block" : "font-display text-xl tracking-wide md:text-2xl"}
          aria-label={isMuseum ? "Museu Historico de Siqueira Campos" : "Secretaria de Cultura"}
        >
          {isMuseum ? (
            <img
              src={museuLogo}
              alt="Museu Historico de Siqueira Campos"
              className="h-14 w-auto object-contain md:h-16"
            />
          ) : (
            <>
              Secretaria de <span className="italic">Cultura</span>
            </>
          )}
        </Link>
        <nav className="hidden gap-8 text-sm uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              activeProps={{ className: "text-foreground" }}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileMenu items={items} variant={menu} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-display text-2xl">Secretaria Municipal de Cultura</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Cultura, memoria, leitura e criacao em Siqueira Campos.
          </p>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-muted-foreground">Equipamentos</p>
          <p className="mt-3">Museu Historico Municipal</p>
          <p>Biblioteca Municipal</p>
          <p>Casa da Cultura</p>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-muted-foreground">Contato</p>
          <p className="mt-3">Centro - Siqueira Campos - PR</p>
          <p>(43) 0000-0000</p>
          <p>cultura@siqueiracampos.pr.gov.br</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        (c) {new Date().getFullYear()} - Secretaria Municipal de Cultura de Siqueira Campos
      </div>
    </footer>
  );
}
