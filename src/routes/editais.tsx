import { Link, createFileRoute } from "@tanstack/react-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ClipboardList, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  getOpportunityDocuments,
  isRegistrationOpportunityOpen,
  registrationOpportunitiesCollection,
  type RegistrationOpportunity,
} from "@/lib/registrations";
import { seoHead, socialImages } from "@/lib/seo";

export const Route = createFileRoute("/editais")({
  head: () =>
    seoHead({
      title: "Editais e chamadas culturais",
      description:
        "Acompanhe editais, chamamentos e oportunidades publicados pela Secretaria Municipal de Cultura.",
      path: "/editais",
      image: socialImages.edicts,
    }),
  component: Editais,
});

function Editais() {
  const [edicts, setEdicts] = useState<RegistrationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEdicts() {
      if (!isFirebaseConfigured || !firebaseDb) {
        setLoading(false);
        setMessage("Os editais online ainda nao estao configurados.");
        return;
      }

      try {
        const snapshot = await getDocs(
          query(
            collection(firebaseDb, registrationOpportunitiesCollection),
            orderBy("title", "asc"),
          ),
        );
        setEdicts(
          snapshot.docs
            .map((edictDoc) => ({
              id: edictDoc.id,
              ...(edictDoc.data() as Omit<RegistrationOpportunity, "id">),
            }))
            .filter(
              (opportunity) =>
                opportunity.type === "edital" && opportunity.active !== false,
            ),
        );
      } catch (error) {
        console.error(error);
        setMessage("Nao foi possivel carregar os editais. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    void loadEdicts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <SiteHeader />
      <main>
        <section className="border-b border-[#E7E7EF] bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 md:px-10 md:pt-36">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D]">
              <FileText className="h-4 w-4" />
              Editais
            </p>
            <h1 className="mt-5 max-w-4xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-6xl">
              Editais e chamadas culturais.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#4B4A5F] md:text-lg">
              Consulte os documentos publicados e, quando houver inscricao aberta, acesse o formulario do edital.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          {loading && (
            <p className="border-2 border-[#E2E2EA] bg-white p-5 text-sm text-[#5F5D70]">
              Carregando editais...
            </p>
          )}
          {message && (
            <p className="border-2 border-[#0B86D8] bg-white p-5 text-sm font-semibold text-[#414296]">
              {message}
            </p>
          )}
          {!loading && edicts.length === 0 && !message && (
            <p className="border-2 border-[#E2E2EA] bg-white p-5 text-sm text-[#5F5D70]">
              No momento nao ha editais publicados.
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {edicts.map((edict) => {
              const isOpen = isRegistrationOpportunityOpen(edict);
              const hasRegistrationForm = isOpen && Boolean(edict.fields?.length);
              const registrationUrl = isOpen ? edict.registrationUrl?.trim() : "";
              const edictStatus = isOpen ? "Edital aberto" : "Edital publicado";

              return (
                <article
                  key={edict.id}
                  className="overflow-hidden border-2 border-[#E2E2EA] bg-white"
                >
                  {edict.bannerUrl && (
                    <img
                      src={edict.bannerUrl}
                      alt={`Banner de ${edict.title}`}
                      className="h-56 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1B2D]">
                      {edictStatus}
                    </p>
                    <h2 className="mt-3 font-sans text-3xl font-black text-[#414296]">
                      {edict.title}
                    </h2>
                    {edict.description && (
                      <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">
                        {edict.description}
                      </p>
                    )}
                    <div className="mt-6 grid gap-4">
                      {getOpportunityDocuments(edict).length > 0 && (
                        <div className="grid gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#414296]">
                            Anexos do edital
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {getOpportunityDocuments(edict).map((documentItem, index) => (
                              <a
                                key={documentItem.url}
                                href={documentItem.url}
                                className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                              >
                                <FileText className="h-4 w-4" />
                                {documentItem.name || `Anexo ${index + 1}`}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {registrationUrl ? (
                        <a
                          href={registrationUrl}
                          className="inline-flex items-center gap-2 bg-[#EF1B2D] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#414296]"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Inscrever-se
                        </a>
                      ) : hasRegistrationForm ? (
                        <Link
                          to="/inscricoes"
                          search={{ atividade: edict.id }}
                          className="inline-flex items-center gap-2 bg-[#EF1B2D] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#414296]"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Inscrever-se
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
