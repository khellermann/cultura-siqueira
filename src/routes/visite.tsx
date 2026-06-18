import { createFileRoute } from "@tanstack/react-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CalendarDays, Clipboard, Mail, Phone } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { cultureContact, formatPhones } from "@/lib/contact";
import { firebaseDb } from "@/lib/firebase";
import {
  visitRequestsCollection,
  type VisitRequestInput,
} from "@/lib/visitRequests";

type VisitForm = {
  groupName: string;
  responsibleName: string;
  phone: string;
  email: string;
  visitorsCount: string;
  ageGroup: string;
  date: string;
  time: string;
  objective: string;
  notes: string;
};

const initialVisitForm: VisitForm = {
  groupName: "",
  responsibleName: "",
  phone: "",
  email: "",
  visitorsCount: "",
  ageGroup: "",
  date: "",
  time: "",
  objective: "",
  notes: "",
};

const inputClass =
  "w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground";
const labelClass = "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

export const Route = createFileRoute("/visite")({
  head: () => ({
    meta: [
      { title: "Visite - Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "Horários, endereço, contato e formulário para planejar visitas escolares e grupos ao Museu de Siqueira Campos.",
      },
      { property: "og:title", content: "Planeje sua visita ao Museu" },
      { property: "og:description", content: "Terça a sábado - entrada gratuita." },
    ],
    links: [{ rel: "canonical", href: "https://cultura.siqueiracampos.pr.gov.br/visite" }],
  }),
  component: Visite,
});

function Visite() {
  const [form, setForm] = useState<VisitForm>(initialVisitForm);
  const [requestText, setRequestText] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const mailHref = useMemo(() => {
    const subject = "Solicitação de visita ao Museu Histórico Municipal";
    const body = requestText || buildVisitRequest(form);
    return `mailto:${cultureContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form, requestText]);

  function updateField(field: keyof VisitForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setCopyMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRequestText = buildVisitRequest(form);
    setRequestText(nextRequestText);
    setSaving(true);
    setCopyMessage("");

    if (!firebaseDb) {
      setSaving(false);
      setCopyMessage(
        "Solicitação pronta, mas o Firebase não está configurado neste ambiente. Envie por e-mail ou telefone.",
      );
      return;
    }

    const payload: VisitRequestInput = {
      ageGroup: form.ageGroup.trim(),
      date: form.date,
      email: form.email.trim(),
      groupName: form.groupName.trim(),
      notes: form.notes.trim(),
      objective: form.objective.trim(),
      phone: form.phone.trim(),
      requestText: nextRequestText,
      responsibleName: form.responsibleName.trim(),
      time: form.time,
      visitorsCount: form.visitorsCount.trim(),
    };

    try {
      await addDoc(collection(firebaseDb, visitRequestsCollection), {
        ...payload,
        createdAt: serverTimestamp(),
        status: "novo",
      });
      setCopyMessage(
        "Solicitação enviada para o administrador. A equipe da Cultura entrará em contato para confirmar.",
      );
      setForm(initialVisitForm);
    } catch (error) {
      console.error(error);
      setCopyMessage(
        "Não foi possível enviar para o administrador. Envie por e-mail ou telefone e tente novamente depois.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const text = requestText || buildVisitRequest(form);

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Solicitação copiada.");
    } catch {
      setCopyMessage("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
      setRequestText(text);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Planeje sua visita
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
              Uma manhã no museu pode virar memória para a vida inteira.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Para visitas escolares e grupos, envie uma solicitação com os dados principais. A
              equipe da Cultura retornará para confirmar a melhor data, horário e mediação.
            </p>
          </div>
          <div className="md:col-span-6">
            <img
              src="/museu-galeria/museu-galeria-13.jpeg"
              alt="Sala expositiva do Museu Histórico Municipal com vitrines e fotografias"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <aside className="md:col-span-4">
            <div className="sticky top-6 space-y-8">
              <div className="border-t border-foreground pt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Horários</p>
                <dl className="mt-8 space-y-4 font-display text-2xl">
                  <div className="flex justify-between gap-4 border-b border-border pb-3">
                    <dt>Terça - Sexta</dt>
                    <dd>09h - 17h</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-border pb-3">
                    <dt>Sábado</dt>
                    <dd>09h - 13h</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-border pb-3 text-muted-foreground">
                    <dt>Domingo e Segunda</dt>
                    <dd>Fechado</dd>
                  </div>
                </dl>
                <p className="mt-8 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Entrada gratuita
                </p>
              </div>

              <div className="border border-border p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Endereço & contato</p>
                <p className="mt-6 font-display text-2xl leading-tight">
                  {cultureContact.addressLine1}
                  <br />
                  {cultureContact.addressLine2}
                </p>
                <div className="mt-8 space-y-4 text-sm">
                  <p>
                    <span className="block uppercase tracking-[0.2em] text-muted-foreground">
                      Telefone
                    </span>
                    <span className="mt-2 block leading-relaxed">{formatPhones()}</span>
                  </p>
                  <p>
                    <span className="block uppercase tracking-[0.2em] text-muted-foreground">
                      Museu
                    </span>
                    <span className="mt-2 block">Ramal 627</span>
                  </p>
                  <p>
                    <span className="block uppercase tracking-[0.2em] text-muted-foreground">
                      E-mail
                    </span>
                    <span className="mt-2 block break-words">{cultureContact.email}</span>
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="md:col-span-8">
            <form onSubmit={handleSubmit} className="border border-border bg-card p-6 md:p-8">
              <div className="mb-8">
                <CalendarDays className="h-6 w-6 text-accent" />
                <h2 className="mt-6 font-display text-4xl leading-tight">
                  Solicitar visita para grupo ou escola
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Preencha os dados abaixo para enviar a solicitação ao administrador. A equipe
                  retornará pelo telefone ou e-mail informado para confirmar.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nome da escola ou grupo">
                  <input
                    className={inputClass}
                    required
                    value={form.groupName}
                    onChange={(event) => updateField("groupName", event.target.value)}
                  />
                </Field>
                <Field label="Responsável">
                  <input
                    className={inputClass}
                    required
                    value={form.responsibleName}
                    onChange={(event) => updateField("responsibleName", event.target.value)}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    className={inputClass}
                    required
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </Field>
                <Field label="E-mail opcional">
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
                <Field label="Quantidade de visitantes">
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    required
                    value={form.visitorsCount}
                    onChange={(event) => updateField("visitorsCount", event.target.value)}
                  />
                </Field>
                <Field label="Faixa etária ou série">
                  <input
                    className={inputClass}
                    required
                    placeholder="Ex.: 5º ano, Ensino Médio, grupo adulto"
                    value={form.ageGroup}
                    onChange={(event) => updateField("ageGroup", event.target.value)}
                  />
                </Field>
                <Field label="Data desejada">
                  <input
                    type="date"
                    className={inputClass}
                    required
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                  />
                </Field>
                <Field label="Horário desejado">
                  <input
                    type="time"
                    className={inputClass}
                    required
                    value={form.time}
                    onChange={(event) => updateField("time", event.target.value)}
                  />
                </Field>
                <Field label="Objetivo da visita" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    required
                    placeholder="Conte se a visita é parte de uma aula, pesquisa, projeto cultural ou passeio educativo."
                    value={form.objective}
                    onChange={(event) => updateField("objective", event.target.value)}
                  />
                </Field>
                <Field label="Observações" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="Informe necessidades de acessibilidade, transporte, tempo disponível ou outra informação importante."
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Enviando..." : "Solicitar visita"}
                </button>
                <a
                  href={mailHref}
                  className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.2em] transition hover:border-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Enviar por e-mail
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.2em] transition hover:border-foreground"
                >
                  <Clipboard className="h-4 w-4" />
                  Copiar solicitação
                </button>
                <a
                  href="tel:+554335711122"
                  className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.2em] transition hover:border-foreground"
                >
                  <Phone className="h-4 w-4" />
                  Ligar para a Cultura
                </a>
              </div>
            </form>

            {(copyMessage || requestText) && (
              <div className="mt-8 border border-border bg-background p-6">
                {copyMessage && (
                  <p className="text-sm font-semibold text-foreground">{copyMessage}</p>
                )}
                {requestText && (
                  <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {requestText}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function buildVisitRequest(form: VisitForm) {
  return [
    "Solicitação de visita ao Museu Histórico Municipal",
    "",
    `Escola/grupo: ${form.groupName || "Não informado"}`,
    `Responsável: ${form.responsibleName || "Não informado"}`,
    `Telefone: ${form.phone || "Não informado"}`,
    `E-mail: ${form.email || "Não informado"}`,
    `Quantidade de visitantes: ${form.visitorsCount || "Não informado"}`,
    `Faixa etária/série: ${form.ageGroup || "Não informado"}`,
    `Data desejada: ${form.date || "Não informada"}`,
    `Horário desejado: ${form.time || "Não informado"}`,
    "",
    "Objetivo da visita:",
    form.objective || "Não informado",
    "",
    "Observações:",
    form.notes || "Nenhuma observação informada.",
    "",
    `Contato da Secretaria de Cultura: ${formatPhones()}`,
    "Ramal do Museu: 627",
  ].join("\n");
}
