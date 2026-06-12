import { createFileRoute } from "@tanstack/react-router";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ClipboardList } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  formatOpportunityType,
  isRegistrationOpportunityOpen,
  registrationOpportunitiesCollection,
  registrationsCollection,
  type RegistrationOpportunity,
} from "@/lib/registrations";

type RegistrationFormState = {
  address: string;
  birthDate: string;
  fullName: string;
  opportunityId: string;
  phone: string;
};

const initialRegistrationForm: RegistrationFormState = {
  address: "",
  birthDate: "",
  fullName: "",
  opportunityId: "",
  phone: "",
};

export const Route = createFileRoute("/inscricoes")({
  head: () => ({
    meta: [
      { title: "Inscricoes - Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Inscricoes abertas da Secretaria Municipal de Cultura de Siqueira Campos: oficinas, cursos e eventos.",
      },
    ],
  }),
  component: Inscricoes,
});

function Inscricoes() {
  const [form, setForm] = useState<RegistrationFormState>(initialRegistrationForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [opportunities, setOpportunities] = useState<RegistrationOpportunity[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedOpportunity = useMemo(
    () => opportunities.find((opportunity) => opportunity.id === form.opportunityId),
    [form.opportunityId, opportunities],
  );

  function selectOpportunity(opportunityId: string) {
    setForm((current) => ({ ...current, opportunityId }));
    if (typeof window === "undefined") return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("atividade", opportunityId);
    window.history.replaceState(null, "", nextUrl);
  }

  useEffect(() => {
    async function loadOpportunities() {
      if (!isFirebaseConfigured || !firebaseDb) {
        setLoading(false);
        setMessage("As inscricoes online ainda nao estao configuradas.");
        return;
      }

      try {
        const snapshot = await getDocs(
          query(collection(firebaseDb, registrationOpportunitiesCollection), orderBy("title", "asc")),
        );
        const activeOpportunities = snapshot.docs
          .map((opportunityDoc) => ({
            id: opportunityDoc.id,
            ...(opportunityDoc.data() as Omit<RegistrationOpportunity, "id">),
          }))
          .filter((opportunity) => isRegistrationOpportunityOpen(opportunity));

        const activityParam =
          typeof window === "undefined"
            ? ""
            : new URLSearchParams(window.location.search).get("atividade") || "";
        const initialOpportunity =
          activeOpportunities.find((opportunity) => opportunity.id === activityParam) ??
          activeOpportunities[0];

        setOpportunities(activeOpportunities);
        setForm((current) => ({
          ...current,
          opportunityId: initialOpportunity?.id ?? "",
        }));
      } catch (error) {
        console.error(error);
        setMessage("Nao foi possivel carregar as inscricoes abertas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    void loadOpportunities();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !selectedOpportunity) return;

    const fullName = form.fullName.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    if (!fullName || !form.birthDate || !address || !phone || !form.opportunityId) {
      setMessage("Preencha todos os campos para concluir a inscricao.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await addDoc(collection(firebaseDb, registrationsCollection), {
        address,
        birthDate: form.birthDate,
        createdAt: serverTimestamp(),
        fullName,
        opportunityId: selectedOpportunity.id,
        opportunityTitle: selectedOpportunity.title,
        opportunityType: selectedOpportunity.type,
        phone,
      });

      setForm({
        ...initialRegistrationForm,
        opportunityId: selectedOpportunity.id,
      });
      setMessage("Inscricao enviada com sucesso.");
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel enviar a inscricao. Confira os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <SiteHeader />
      <main>
        <section className="border-b border-[#E7E7EF] bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 md:px-10 md:pt-36">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D]">
              <ClipboardList className="h-4 w-4" />
              Inscricoes
            </p>
            <h1 className="mt-5 max-w-4xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-6xl">
              Inscricoes para oficinas, cursos e eventos.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#4B4A5F] md:text-lg">
              Escolha a atividade, informe seus dados e envie sua inscricao para a Secretaria
              Municipal de Cultura.
            </p>
          </div>
        </section>

        <section className="bg-[#F8F8FB]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D]">
              Inscricoes em aberto
            </p>
            <h2 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296]">
              Oficinas, cursos e eventos disponiveis
            </h2>
            <div className="mt-8 grid gap-4">
              {loading && (
                <p className="border-2 border-[#E2E2EA] bg-white p-5 text-sm text-[#5F5D70]">
                  Carregando inscricoes abertas...
                </p>
              )}
              {!loading && opportunities.length === 0 && (
                <p className="border-2 border-[#E2E2EA] bg-white p-5 text-sm text-[#5F5D70]">
                  No momento nao ha inscricoes abertas.
                </p>
              )}
              {opportunities.map((opportunity) => (
                <button
                  key={opportunity.id}
                  type="button"
                  onClick={() => selectOpportunity(opportunity.id)}
                  className={`overflow-hidden border-2 bg-white text-left transition hover:border-[#EF1B2D] ${
                    form.opportunityId === opportunity.id
                      ? "border-[#EF1B2D] shadow-[0_18px_40px_rgba(239,27,45,0.14)]"
                      : "border-[#E2E2EA]"
                  }`}
                >
                  {opportunity.bannerUrl && (
                    <img
                      src={opportunity.bannerUrl}
                      alt={`Banner de ${opportunity.title}`}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1B2D]">
                      {formatOpportunityType(opportunity.type)}
                    </p>
                    <h3 className="mt-3 font-sans text-2xl font-black text-[#24223A]">
                      {opportunity.title}
                    </h3>
                    {opportunity.description && (
                      <p className="mt-3 text-sm leading-relaxed text-[#5F5D70]">
                        {opportunity.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">
                      Inscrever-se
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
              {selectedOpportunity?.bannerUrl && (
                <img
                  src={selectedOpportunity.bannerUrl}
                  alt={`Banner de ${selectedOpportunity.title}`}
                  className="mb-6 h-56 w-full object-cover"
                />
              )}
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-[#EF1B2D]" />
                <h2 className="font-sans text-3xl font-black text-[#414296]">
                  Formulario de inscricao
                </h2>
              </div>

              {message && (
                <div className="mt-6 border-2 border-[#0B86D8] bg-[#F8F8FB] p-4 text-sm font-semibold text-[#414296]">
                  {message}
                </div>
              )}

              <div className="mt-8 grid gap-5">
                <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                  Oficina, curso ou evento
                  <select
                    value={form.opportunityId}
                    onChange={(event) => selectOpportunity(event.target.value)}
                    className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                    required
                    disabled={loading || opportunities.length === 0}
                  >
                    {opportunities.length === 0 && <option value="">Nenhuma atividade aberta</option>}
                    {opportunities.map((opportunity) => (
                      <option key={opportunity.id} value={opportunity.id}>
                        {formatOpportunityType(opportunity.type)} - {opportunity.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                  Nome completo
                  <input
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                    required
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                    Data de nascimento
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, birthDate: event.target.value }))
                      }
                      className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                    Telefone
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                      placeholder="(43) 99999-9999"
                      required
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                  Endereco
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    className="min-h-28 border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving || loading || opportunities.length === 0}
                  className="inline-flex w-fit items-center justify-center bg-[#EF1B2D] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#414296] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Enviando..." : "Enviar inscricao"}
                </button>
              </div>
            </form>
          </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
