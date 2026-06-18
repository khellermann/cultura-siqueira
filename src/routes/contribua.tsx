import { createFileRoute, Link } from "@tanstack/react-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  ArrowRight,
  BookMarked,
  Camera,
  Clipboard,
  HandHeart,
  Landmark,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import {
  contributionRequestsCollection,
  type ContributionRequestInput,
} from "@/lib/contributionRequests";
import { cultureContact, formatPhones } from "@/lib/contact";
import { firebaseDb } from "@/lib/firebase";

type ContributionForm = {
  address: string;
  contactPreference: string;
  contributionType: string;
  description: string;
  email: string;
  name: string;
  phone: string;
  story: string;
  title: string;
};

const initialContributionForm: ContributionForm = {
  address: "",
  contactPreference: "Telefone",
  contributionType: "Fotografia",
  description: "",
  email: "",
  name: "",
  phone: "",
  story: "",
  title: "",
};

const contributionTypes = [
  "Fotografia",
  "Documento",
  "Objeto antigo",
  "Relato de memória",
  "Identificação de pessoa ou lugar",
  "Parceria educativa",
] as const;

const contactPreferences = ["Telefone", "WhatsApp", "E-mail"] as const;

const inputClass =
  "w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground";
const labelClass = "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

const contributionWays = [
  {
    title: "Doe uma lembrança",
    text: "Fotografias, documentos, cartas, jornais, objetos de família e materiais antigos podem ser avaliados pela equipe para integrar ou contextualizar o acervo.",
    icon: Camera,
  },
  {
    title: "Conte uma história",
    text: "Relatos sobre pessoas, lugares, festas, trabalhos e acontecimentos ajudam a dar voz às peças que já estão preservadas.",
    icon: BookMarked,
  },
  {
    title: "Ajude a identificar",
    text: "Muitas imagens ganham nova vida quando alguém reconhece um rosto, uma rua, uma casa, uma data ou um detalhe esquecido.",
    icon: Search,
  },
  {
    title: "Traga sua escola ou pesquisa",
    text: "Professores, estudantes e pesquisadores podem construir percursos educativos junto ao Museu e fortalecer a memória local.",
    icon: Landmark,
  },
] as const;

export const Route = createFileRoute("/contribua")({
  head: () => ({
    meta: [
      { title: "Contribua - Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "Saiba como contribuir com o Museu de Siqueira Campos por meio de doações, documentos, fotografias e memórias da comunidade.",
      },
      { property: "og:title", content: "Contribua com o Museu de Siqueira Campos" },
      {
        property: "og:description",
        content: "Ajude a preservar a memória histórica e cultural do município.",
      },
    ],
    links: [{ rel: "canonical", href: "https://cultura.siqueiracampos.pr.gov.br/contribua" }],
  }),
  component: Contribua,
});

function Contribua() {
  const [form, setForm] = useState<ContributionForm>(initialContributionForm);
  const [messageText, setMessageText] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const mailHref = useMemo(() => {
    const subject = "Contribuição para o Museu Histórico Municipal";
    const body = messageText || buildContributionMessage(form);
    return `mailto:${cultureContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form, messageText]);

  function updateField(field: keyof ContributionForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessageText = buildContributionMessage(form);
    setMessageText(nextMessageText);
    setSaving(true);
    setStatusMessage("");

    if (!firebaseDb) {
      setSaving(false);
      setStatusMessage(
        "Mensagem pronta, mas o Firebase não está configurado neste ambiente. Envie por e-mail ou telefone.",
      );
      return;
    }

    const payload: ContributionRequestInput = {
      address: form.address.trim(),
      contactPreference: form.contactPreference,
      contributionType: form.contributionType,
      description: form.description.trim(),
      email: form.email.trim(),
      messageText: nextMessageText,
      name: form.name.trim(),
      phone: form.phone.trim(),
      story: form.story.trim(),
      title: form.title.trim(),
    };

    try {
      await addDoc(collection(firebaseDb, contributionRequestsCollection), {
        ...payload,
        createdAt: serverTimestamp(),
        status: "novo",
      });
      setStatusMessage(
        "Contribuição enviada para o administrador. A equipe da Cultura entrará em contato para conversar com você.",
      );
      setForm(initialContributionForm);
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Não foi possível enviar para o administrador. Envie por e-mail ou telefone e tente novamente depois.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const text = messageText || buildContributionMessage(form);

    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Mensagem copiada.");
    } catch {
      setStatusMessage("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
      setMessageText(text);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contribua</p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
              A memória de uma cidade continua viva quando a comunidade participa.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              O Museu recebe doações, histórias, pistas e parcerias que ajudam no trabalho de
              resgate da memória de Siqueira Campos, uma cidade marcada por tantas culturas,
              encontros e trajetórias.
            </p>
          </div>
          <div className="md:col-span-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src="/museu-galeria/museu-galeria-26.jpeg"
                alt="Quadros e recortes de jornal preservados no museu"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="grid gap-4">
                <img
                  src="/museu-galeria/museu-galeria-02.jpeg"
                  alt="Matérias históricas sobre o museu em parede expositiva"
                  className="aspect-[4/3] w-full object-cover"
                />
                <img
                  src="/museu-galeria/museu-galeria-11.jpeg"
                  alt="Escultura em madeira e registros sobre cultura indígena"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-2 md:px-10 lg:grid-cols-4">
          {contributionWays.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-accent" />
                <h2 className="mt-8 font-display text-3xl leading-tight">{item.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <HandHeart className="h-8 w-8 text-accent" />
            <h2 className="mt-8 font-display text-4xl leading-tight md:text-5xl">
              Nem toda contribuição precisa ser um objeto.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:col-span-7">
            <p>
              Às vezes, uma informação muda tudo: o nome de uma pessoa em uma fotografia, a história
              de uma ferramenta, a lembrança de uma festa, o endereço de uma antiga família ou o
              contexto de um documento.
            </p>
            <p>
              Por isso, o Museu também acolhe conversas. A comunidade ajuda a completar lacunas,
              corrigir datas, reconhecer personagens e ampliar o sentido do acervo.
            </p>
            <p className="font-display text-2xl leading-tight text-foreground">
              A memória de uma cidade não fica pronta dentro de uma vitrine. Ela continua viva
              quando a comunidade participa.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Envie sua contribuição</p>
            <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
              Conte para o Museu o que você tem guardado.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              O formulário não substitui a avaliação da equipe, mas abre a conversa. Depois do envio,
              a Cultura entra em contato para entender melhor o material, combinar orientação e
              registrar a memória com cuidado.
            </p>
            <div className="mt-8 border border-border p-5 text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">Contato direto</p>
              <p className="mt-3">{formatPhones()}</p>
              <p>Ramal 627 - Museu</p>
              <p className="break-words">{cultureContact.email}</p>
            </div>
          </div>

          <div className="md:col-span-8">
            <form onSubmit={handleSubmit} className="border border-border bg-card p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Seu nome">
                  <input
                    className={inputClass}
                    required
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
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
                <Field label="Como prefere o contato">
                  <select
                    className={inputClass}
                    value={form.contactPreference}
                    onChange={(event) => updateField("contactPreference", event.target.value)}
                  >
                    {contactPreferences.map((preference) => (
                      <option key={preference} value={preference}>
                        {preference}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipo de contribuição">
                  <select
                    className={inputClass}
                    value={form.contributionType}
                    onChange={(event) => updateField("contributionType", event.target.value)}
                  >
                    {contributionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Título ou assunto">
                  <input
                    className={inputClass}
                    required
                    placeholder="Ex.: Foto da antiga estação, objeto de família..."
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                  />
                </Field>
                <Field label="Endereço/bairro opcional" className="md:col-span-2">
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                  />
                </Field>
                <Field label="Descreva o material ou a lembrança" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    required
                    placeholder="Conte o que é, de quando pode ser, quem aparece, onde estava guardado ou por que pode ser importante."
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                  />
                </Field>
                <Field label="História por trás da contribuição" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Se souber, conte a história, nomes, lugares, datas aproximadas ou lembranças relacionadas."
                    value={form.story}
                    onChange={(event) => updateField("story", event.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Enviando..." : "Enviar contribuição"}
                  <ArrowRight className="h-4 w-4" />
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
                  Copiar mensagem
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

            {(statusMessage || messageText) && (
              <div className="mt-8 border border-border bg-background p-6">
                {statusMessage && (
                  <p className="text-sm font-semibold text-foreground">{statusMessage}</p>
                )}
                {messageText && (
                  <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {messageText}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="border border-border bg-background p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Também dá para visitar</p>
            <p className="mt-6 max-w-3xl font-display text-3xl leading-tight md:text-4xl">
              Quer aproximar sua escola, grupo ou pesquisa do Museu? Planeje uma visita mediada e
              transforme o acervo em ponto de encontro.
            </p>
            <div className="mt-10">
              <Link
                to="/visite"
                className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.2em] transition hover:border-foreground"
              >
                Planejar visita
              </Link>
            </div>
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

function buildContributionMessage(form: ContributionForm) {
  return [
    "Contribuição para o Museu Histórico Municipal",
    "",
    `Nome: ${form.name || "Não informado"}`,
    `Telefone: ${form.phone || "Não informado"}`,
    `E-mail: ${form.email || "Não informado"}`,
    `Preferência de contato: ${form.contactPreference || "Não informada"}`,
    `Endereço/bairro: ${form.address || "Não informado"}`,
    "",
    `Tipo de contribuição: ${form.contributionType || "Não informado"}`,
    `Título/assunto: ${form.title || "Não informado"}`,
    "",
    "Descrição:",
    form.description || "Não informada",
    "",
    "História relacionada:",
    form.story || "Não informada",
    "",
    `Contato da Secretaria de Cultura: ${formatPhones()}`,
    "Ramal do Museu: 627",
  ].join("\n");
}
