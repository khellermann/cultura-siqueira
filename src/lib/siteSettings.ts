export const siteSettingsCollection = "site_settings";
export const navigationSettingsDocId = "navigation";

export type PublicPageArea = "Secretaria" | "Museu";

export type PublicPage = {
  area: PublicPageArea;
  label: string;
  path: string;
  title: string;
};

export const publicPages = [
  { title: "Home", label: "Home", path: "/", area: "Secretaria" },
  { title: "Museu", label: "Museu", path: "/museu", area: "Museu" },
  { title: "Biblioteca", label: "Biblioteca", path: "/biblioteca", area: "Secretaria" },
  { title: "Casa da Cultura", label: "Casa da Cultura", path: "/casa-da-cultura", area: "Secretaria" },
  { title: "Editais", label: "Editais", path: "/editais", area: "Secretaria" },
  { title: "Inscricoes", label: "Inscricoes", path: "/inscricoes", area: "Secretaria" },
  { title: "Eventos", label: "Eventos", path: "/eventos", area: "Secretaria" },
  { title: "Acervo", label: "Acervo", path: "/acervo", area: "Museu" },
  { title: "Sobre", label: "Sobre", path: "/sobre", area: "Museu" },
  { title: "Visite", label: "Visite", path: "/visite", area: "Museu" },
  { title: "Contribua", label: "Contribua", path: "/contribua", area: "Museu" },
] as const satisfies readonly PublicPage[];

export const defaultMenuVisibility = publicPages.reduce<Record<string, boolean>>((current, page) => {
  current[page.path] = true;
  return current;
}, {});

export const secretariaMenuItems = publicPages.filter((page) =>
  ["/", "/museu", "/biblioteca", "/casa-da-cultura", "/editais", "/inscricoes", "/eventos"].includes(
    page.path,
  ),
);

export const museumMenuItems = publicPages.filter((page) =>
  ["/", "/acervo", "/sobre", "/visite", "/contribua"].includes(page.path),
);

export function mergeMenuVisibility(items?: Record<string, unknown>) {
  return publicPages.reduce<Record<string, boolean>>((current, page) => {
    current[page.path] = typeof items?.[page.path] === "boolean" ? Boolean(items[page.path]) : true;
    return current;
  }, {});
}
