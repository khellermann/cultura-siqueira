import { Link, createFileRoute } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ClipboardList, Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  getOpportunityDocuments,
  isRegistrationOpportunityOpen,
  registrationOpportunitiesCollection,
  type RegistrationOpportunity,
} from "@/lib/registrations";
import { getEdictIdFromSlug, seoHead, socialImages } from "@/lib/seo";

export const Route = createFileRoute("/editais_/$slug")({
  head: () =>
    seoHead({
      title: "Detalhes do edital",
      description:
        "Consulte os detalhes, documentos e informacoes de inscricao dos editais culturais publicados.",
      path: "/editais",
      image: socialImages.edicts,
      type: "article",
    }),
  component: EditalDetail,
});

function EditalDetail() {
  const { slug } = Route.useParams();
  const edictId = useMemo(() => getEdictIdFromSlug(slug), [slug]);
  const [edict, setEdict] = useState<RegistrationOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEdict() {
      if (!isFirebaseConfigured || !firebaseDb) {
        setMessage("Os editais online ainda nao estao configurados.");
        setLoading(false);
        return;
      }

      try {
        const edictSnapshot = await getDoc(
          doc(firebaseDb, registrationOpportunitiesCollection, edictId),
        );

        if (!edictSnapshot.exists()) {
          setMessage("Edital nao encontrado.");
          return;
        }

        const loadedEdict = {
          id: edictSnapshot.id,
          ...(edictSnapshot.data() as Omit<RegistrationOpportunity, "id">),
        };

        if (loadedEdict.type !== "edital") {
          setMessage("Edital nao encontrado.");
          return;
        }

        setEdict(loadedEdict);
      } catch (error) {
        console.error(error);
        setMessage("Nao foi possivel carregar este edital. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    void loadEdict();
  }, [edictId]);

  const isOpen = edict ? isRegistrationOpportunityOpen(edict) : false;
  const documents = edict ? getOpportunityDocuments(edict) : [];
  const registrationUrl = isOpen ? edict?.registrationUrl?.trim() : "";
  const hasRegistrationForm = isOpen && Boolean(edict?.fields?.length);

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <SiteHeader />
      <main>
        <section className="border-b border-[#E7E7EF] bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 md:px-10 md:pt-36">
            <Link
              to="/editais"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:text-[#0B86D8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para editais
            </Link>
            <p className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D]">
              <FileText className="h-4 w-4" />
              Edital
            </p>
            <h1 className="mt-5 max-w-5xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-6xl">
              {edict?.title ?? (loading ? "Carregando edital..." : "Edital nao encontrado")}
            </h1>
            {edict && (
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                <span className="border-2 border-[#414296] px-4 py-3 text-[#414296]">
                  {isOpen ? "Inscricoes abertas" : "Edital publicado"}
                </span>
                {(edict.startDate || edict.endDate) && (
                  <span className="border-2 border-[#E2E2EA] px-4 py-3 text-[#5F5D70]">
                    {formatEdictPeriod(edict)}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-16">
          <article className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
            {loading && <p className="text-sm text-[#5F5D70]">Carregando edital...</p>}
            {message && !loading && (
              <p className="text-sm font-semibold text-[#414296]">{message}</p>
            )}
            {edict && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B86D8]">
                  Sobre o edital
                </p>
                <div className="mt-5 whitespace-pre-line text-base leading-relaxed text-[#4B4A5F]">
                  {edict.description || "Descricao nao informada."}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {registrationUrl ? (
                    <a
                      href={registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#EF1B2D] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#414296]"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Inscrever-se
                    </a>
                  ) : hasRegistrationForm ? (
                    <Link
                      to="/inscricoes"
                      search={{ atividade: edict.id }}
                      className="inline-flex items-center gap-2 bg-[#EF1B2D] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#414296]"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Inscrever-se
                    </Link>
                  ) : null}
                </div>
              </>
            )}
          </article>

          <aside className="border-2 border-[#414296] bg-white p-6 md:p-8">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#414296]">
              <Download className="h-4 w-4" />
              Arquivos do edital
            </p>
            <div className="mt-6 grid gap-3">
              {documents.length === 0 && (
                <p className="text-sm leading-relaxed text-[#5F5D70]">
                  Nenhum arquivo publicado para este edital.
                </p>
              )}
              {documents.map((documentItem, index) => (
                <a
                  key={documentItem.url || documentItem.path || index}
                  href={documentItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 border-2 border-[#E2E2EA] px-4 py-4 text-sm font-semibold text-[#24223A] transition hover:border-[#0B86D8] hover:text-[#0B86D8]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[#EF1B2D]" />
                    <span className="truncate">{documentItem.name || `Anexo ${index + 1}`}</span>
                  </span>
                  <Download className="h-4 w-4 shrink-0 transition group-hover:translate-y-0.5" />
                </a>
              ))}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function formatEdictPeriod(edict: RegistrationOpportunity) {
  if (edict.startDate && edict.endDate) {
    return `${formatDate(edict.startDate)} a ${formatDate(edict.endDate)}`;
  }
  if (edict.startDate) return `A partir de ${formatDate(edict.startDate)}`;
  if (edict.endDate) return `Ate ${formatDate(edict.endDate)}`;
  return "Periodo nao informado";
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
