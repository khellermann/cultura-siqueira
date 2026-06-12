import { createFileRoute } from "@tanstack/react-router";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ClipboardList, Mail, Printer } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import culturaLogo from "@/assets/cultura-logo-horizontal.png";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  formatOpportunityType,
  getDefaultRegistrationFields,
  getOpportunityDocuments,
  isRegistrationOpportunityOpen,
  registrationOpportunitiesCollection,
  registrationsCollection,
  type RegistrationFieldKey,
  type RegistrationOpportunity,
} from "@/lib/registrations";

type RegistrationFormState = {
  address: string;
  birthDate: string;
  document: string;
  email: string;
  fullName: string;
  opportunityId: string;
  phone: string;
};

const initialRegistrationForm: RegistrationFormState = {
  address: "",
  birthDate: "",
  document: "",
  email: "",
  fullName: "",
  opportunityId: "",
  phone: "",
};

type RegistrationReceipt = {
  address: string;
  document: string;
  email: string;
  id: string;
  opportunityDescription: string;
  opportunityTitle: string;
  opportunityType: string;
  participantName: string;
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
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedOpportunity = useMemo(
    () => opportunities.find((opportunity) => opportunity.id === form.opportunityId),
    [form.opportunityId, opportunities],
  );
  const selectedFields = useMemo(
    () =>
      selectedOpportunity?.fields?.length
        ? selectedOpportunity.fields
        : getDefaultRegistrationFields(selectedOpportunity?.type ?? "oficina"),
    [selectedOpportunity],
  );

  function getFormValue(fieldKey: RegistrationFieldKey) {
    return form[fieldKey] ?? "";
  }

  function setFormValue(fieldKey: RegistrationFieldKey, value: string) {
    setForm((current) => ({ ...current, [fieldKey]: value }));
  }

  function selectOpportunity(opportunityId: string) {
    setForm((current) => ({ ...current, opportunityId }));
    if (typeof window === "undefined") return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("atividade", opportunityId);
    window.history.replaceState(null, "", nextUrl);
  }

  function getReceiptEmailUrl(receiptData: RegistrationReceipt) {
    const subject = `Comprovante de inscricao - ${receiptData.opportunityTitle}`;
    const body = [
      "Comprovante de inscricao",
      "",
      `Codigo: ${receiptData.id}`,
      `${receiptData.opportunityType}: ${receiptData.opportunityTitle}`,
      `Nome/Razao social: ${receiptData.participantName}`,
      `CPF/CNPJ: ${receiptData.document || "Nao informado"}`,
      `Endereco: ${receiptData.address || "Nao informado"}`,
      "",
      "Secretaria Municipal de Cultura de Siqueira Campos/PR",
    ].join("\n");

    return `mailto:${encodeURIComponent(receiptData.email)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  function handlePrintReceipt() {
    window.print();
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
    const formData = selectedFields.reduce<Record<string, string>>((current, field) => {
      current[field.key] = getFormValue(field.key).trim();
      return current;
    }, {});

    const missingRequiredField = selectedFields.find(
      (field) => field.required && !formData[field.key],
    );
    if (missingRequiredField || !form.opportunityId) {
      setMessage("Preencha todos os campos para concluir a inscricao.");
      return;
    }

    setSaving(true);
    setMessage("");
    setReceipt(null);

    try {
      const registrationDoc = await addDoc(collection(firebaseDb, registrationsCollection), {
        address: formData.address ?? "",
        birthDate: formData.birthDate ?? "",
        createdAt: serverTimestamp(),
        document: formData.document ?? "",
        email: formData.email ?? "",
        formData,
        fullName: fullName || formData.fullName || "",
        opportunityId: selectedOpportunity.id,
        opportunityTitle: selectedOpportunity.title,
        opportunityType: selectedOpportunity.type,
        phone: formData.phone ?? "",
      });

      setForm({
        ...initialRegistrationForm,
        opportunityId: selectedOpportunity.id,
      });
      setMessage("Inscricao enviada com sucesso.");
      setReceipt({
        address: formData.address ?? "",
        document: formData.document ?? "",
        email: formData.email ?? "",
        id: registrationDoc.id,
        opportunityDescription: selectedOpportunity.description ?? "",
        opportunityTitle: selectedOpportunity.title,
        opportunityType: formatOpportunityType(selectedOpportunity.type),
        participantName: fullName || formData.fullName || "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel enviar a inscricao. Confira os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 14mm;
            }

            html,
            body {
              background: #ffffff !important;
            }

            body * {
              visibility: hidden !important;
            }

            .registration-receipt,
            .registration-receipt * {
              visibility: visible !important;
            }

            .registration-receipt {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              break-inside: avoid;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .registration-receipt-actions,
            .registration-receipt-actions * {
              display: none !important;
              visibility: hidden !important;
            }
          }
        `}
      </style>
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
              {selectedOpportunity && getOpportunityDocuments(selectedOpportunity).length > 0 && (
                <div className="mb-6 grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#414296]">
                    Anexos do edital
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {getOpportunityDocuments(selectedOpportunity).map((documentItem, index) => (
                      <a
                        key={documentItem.url}
                        href={documentItem.url}
                        className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                      >
                        {documentItem.name || `Anexo ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
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

              {receipt && (
                <div className="registration-receipt mt-6 border-2 border-[#414296] bg-white p-5 shadow-[0_18px_40px_rgba(65,66,150,0.12)]">
                  <div className="border-2 border-dashed border-[#BFC0D8] bg-[#F8F8FB] p-5">
                    <div className="flex flex-col gap-4 border-b-2 border-[#E2E2EA] pb-5 md:flex-row md:items-center md:justify-between">
                      <img
                        src={culturaLogo}
                        alt="Secretaria Municipal de Cultura"
                        className="h-14 w-fit object-contain"
                      />
                      <div className="text-left md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00A859]">
                          Comprovante de inscricao
                        </p>
                        <p className="mt-2 font-mono text-xl font-black text-[#414296]">
                          {receipt.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1B2D]">
                          {receipt.opportunityType}
                        </p>
                        <h3 className="mt-2 font-sans text-2xl font-black text-[#414296]">
                          {receipt.opportunityTitle}
                        </h3>
                        {receipt.opportunityDescription && (
                          <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">
                            {receipt.opportunityDescription}
                          </p>
                        )}
                      </div>

                      <dl className="grid gap-3 text-sm md:grid-cols-2">
                        <div className="border-2 border-[#E2E2EA] bg-white p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5F5D70]">
                            Nome/Razao social
                          </dt>
                          <dd className="mt-1 font-semibold text-[#24223A]">
                            {receipt.participantName || "Nao informado"}
                          </dd>
                        </div>
                        <div className="border-2 border-[#E2E2EA] bg-white p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5F5D70]">
                            CPF/CNPJ
                          </dt>
                          <dd className="mt-1 font-semibold text-[#24223A]">
                            {receipt.document || "Nao informado"}
                          </dd>
                        </div>
                        <div className="border-2 border-[#E2E2EA] bg-white p-3 md:col-span-2">
                          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5F5D70]">
                            Endereco
                          </dt>
                          <dd className="mt-1 font-semibold text-[#24223A]">
                            {receipt.address || "Nao informado"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="registration-receipt-actions mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="inline-flex items-center gap-2 border-2 border-[#00A859] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#00A859] transition hover:bg-[#00A859] hover:text-white"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir comprovante
                    </button>
                    {receipt.email ? (
                      <a
                        href={getReceiptEmailUrl(receipt)}
                        className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                      >
                        <Mail className="h-4 w-4" />
                        Enviar por email
                      </a>
                    ) : (
                      <span className="inline-flex items-center border-2 border-[#E2E2EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5F5D70]">
                        Informe e-mail para envio
                      </span>
                    )}
                  </div>
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

                <div className="grid gap-5 md:grid-cols-2">
                  {selectedFields.map((field) => (
                    <label
                      key={field.key}
                      className={`grid gap-2 text-sm font-semibold text-[#414296] ${
                        field.key === "address" ? "md:col-span-2" : ""
                      }`}
                    >
                      {field.label}
                      {field.key === "address" ? (
                        <textarea
                          value={getFormValue(field.key)}
                          onChange={(event) => setFormValue(field.key, event.target.value)}
                          className="min-h-28 border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={
                            field.key === "birthDate"
                              ? "date"
                              : field.key === "email"
                                ? "email"
                                : "text"
                          }
                          value={getFormValue(field.key)}
                          onChange={(event) => setFormValue(field.key, event.target.value)}
                          className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          required={field.required}
                        />
                      )}
                    </label>
                  ))}
                </div>

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
