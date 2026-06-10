import { createFileRoute } from "@tanstack/react-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { SiteFooter } from "@/components/SiteHeader";
import culturaLogo from "@/assets/cultura-logo-stacked.png";
import { firebaseAuth, firebaseDb, firebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import {
  adminUsersCollection,
  equipmentOptions,
  eventsCollection,
  isPrimaryAdmin,
  normalizeEmail,
  primaryAdminEmail,
  secretaryOptions,
  type AdminUser,
  type CulturalEvent,
  type EventPeriodUnit,
} from "@/lib/events";

type AdminAccess = "loading" | "allowed" | "denied" | "signed-out";
type AdminPanel = "overview" | "events" | "registrations" | "pages" | "admins";

type EventFormState = {
  date: string;
  equipment: string[];
  name: string;
  periodAmount: string;
  periodUnit: EventPeriodUnit;
  secretary: string;
};

const initialEventForm: EventFormState = {
  date: "",
  equipment: [],
  name: "",
  periodAmount: "1",
  periodUnit: "horas",
  secretary: secretaryOptions[0],
};

const adminPanels = [
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "events", label: "Eventos", icon: CalendarDays },
  { id: "registrations", label: "Inscricoes", icon: ClipboardList },
  { id: "pages", label: "Paginas", icon: FileText },
] satisfies Array<{ id: AdminPanel; label: string; icon: LucideIcon }>;

const publicPages = [
  { title: "Home", path: "/", area: "Secretaria" },
  { title: "Museu", path: "/museu", area: "Museu" },
  { title: "Biblioteca", path: "/biblioteca", area: "Secretaria" },
  { title: "Casa da Cultura", path: "/casa-da-cultura", area: "Secretaria" },
  { title: "Inscricoes", path: "/inscricoes", area: "Secretaria" },
  { title: "Eventos", path: "/eventos", area: "Secretaria" },
  { title: "Acervo", path: "/acervo", area: "Museu" },
  { title: "Sobre", path: "/sobre", area: "Museu" },
  { title: "Visite", path: "/visite", area: "Museu" },
  { title: "Contribua", path: "/contribua", area: "Museu" },
] as const;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - Secretaria Municipal de Cultura" },
      {
        name: "description",
        content: "Area administrativa da Secretaria Municipal de Cultura de Siqueira Campos.",
      },
    ],
  }),
  component: Admin,
});

async function checkAdminAccess(user: User | null) {
  if (!user?.email || !firebaseDb) return false;
  const email = normalizeEmail(user.email);
  if (isPrimaryAdmin(email)) return true;
  const adminDoc = await getDoc(doc(firebaseDb, adminUsersCollection, email));
  return adminDoc.exists();
}

function Admin() {
  const [access, setAccess] = useState<AdminAccess>("loading");
  const [adminEmail, setAdminEmail] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [flyer, setFlyer] = useState<File | null>(null);
  const [form, setForm] = useState<EventFormState>(initialEventForm);
  const [message, setMessage] = useState("");
  const [panel, setPanel] = useState<AdminPanel>("overview");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const canManageAdmins = isPrimaryAdmin(user?.email);
  const authReady = isFirebaseConfigured && firebaseAuth && firebaseDb;

  async function loadAdminData() {
    if (!firebaseDb) return;

    const [adminsSnapshot, eventsSnapshot] = await Promise.all([
      getDocs(query(collection(firebaseDb, adminUsersCollection), orderBy("email", "asc"))),
      getDocs(query(collection(firebaseDb, eventsCollection), orderBy("date", "desc"))),
    ]);

    setAdmins(
      adminsSnapshot.docs.map((adminDoc) => ({
        id: adminDoc.id,
        ...(adminDoc.data() as Omit<AdminUser, "id">),
      })),
    );

    setEvents(
      eventsSnapshot.docs.map((eventDoc) => ({
        id: eventDoc.id,
        ...(eventDoc.data() as Omit<CulturalEvent, "id">),
      })),
    );
  }

  useEffect(() => {
    if (!authReady) {
      setAccess("denied");
      return;
    }

    return onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccess("signed-out");
        return;
      }

      setAccess("loading");
      const allowed = await checkAdminAccess(currentUser);
      setAccess(allowed ? "allowed" : "denied");
      if (allowed) await loadAdminData();
    });
  }, [authReady]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );
  const upcomingEvents = useMemo(
    () => sortedEvents.filter((event) => !event.date || event.date >= new Date().toISOString().slice(0, 10)),
    [sortedEvents],
  );

  async function handleLogin() {
    if (!firebaseAuth) return;
    setMessage("");
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel abrir o login do Google. Confira o provedor Google no Firebase.");
    }
  }

  async function handleLogout() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  }

  function toggleEquipment(item: string) {
    setForm((current) => ({
      ...current,
      equipment: current.equipment.includes(item)
        ? current.equipment.filter((selected) => selected !== item)
        : [...current.equipment, item],
    }));
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !user?.email) return;

    setSaving(true);
    setMessage("");

    try {
      let flyerPath = "";
      let flyerUrl = "";

      if (flyer && firebaseStorage) {
        flyerPath = `eventos/${Date.now()}-${flyer.name}`;
        const flyerRef = ref(firebaseStorage, flyerPath);
        await uploadBytes(flyerRef, flyer);
        flyerUrl = await getDownloadURL(flyerRef);
      }

      await addDoc(collection(firebaseDb, eventsCollection), {
        createdAt: serverTimestamp(),
        createdBy: user.email,
        date: form.date,
        equipment: form.equipment,
        flyerPath,
        flyerUrl,
        name: form.name.trim(),
        periodAmount: Number(form.periodAmount),
        periodUnit: form.periodUnit,
        secretary: form.secretary,
      });

      setForm(initialEventForm);
      setFlyer(null);
      setMessage("Evento cadastrado com sucesso.");
      await loadAdminData();
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel cadastrar o evento. Confira o Firebase e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !user?.email || !canManageAdmins) return;

    const email = normalizeEmail(adminEmail);
    if (!email) return;

    await setDoc(doc(firebaseDb, adminUsersCollection, email), {
      createdAt: serverTimestamp(),
      createdBy: user.email,
      email,
    });

    setAdminEmail("");
    setMessage("Administrador autorizado.");
    await loadAdminData();
  }

  async function handleDeleteAdmin(email: string) {
    if (!firebaseDb || !canManageAdmins || isPrimaryAdmin(email)) return;
    await deleteDoc(doc(firebaseDb, adminUsersCollection, normalizeEmail(email)));
    setMessage("Administrador removido.");
    await loadAdminData();
  }

  async function handleDeleteEvent(eventId: string) {
    if (!firebaseDb) return;
    await deleteDoc(doc(firebaseDb, eventsCollection, eventId));
    setMessage("Evento removido.");
    await loadAdminData();
  }

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {access === "allowed" && (
          <div className="mb-10 flex flex-col gap-6 border-b border-[#E2E2EA] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#00A859]">
                <ShieldCheck className="h-4 w-4" />
                Area administrativa
              </p>
              <h1 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296] md:text-6xl">
                Painel administrativo
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5F5D70]">
                Gerencie eventos, inscricoes, paginas do site e usuarios autorizados em um so lugar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 border-2 border-[#414296] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}

        {!authReady && (
          <AdminNotice
            title="Firebase ainda nao configurado"
            text="Configure as variaveis VITE_FIREBASE_* no Vercel e no .env local para ativar login, banco de dados e upload de flyers."
          />
        )}

        {authReady && access === "signed-out" && (
          <section className="mx-auto flex min-h-[32rem] max-w-xl items-center justify-center">
            <div className="w-full border-2 border-[#E2E2EA] bg-white px-6 py-10 text-center shadow-[0_24px_60px_rgba(65,66,150,0.12)] md:px-10">
              <img
                src={culturaLogo}
                alt="Secretaria Municipal de Cultura de Siqueira Campos"
                className="mx-auto h-32 w-auto object-contain md:h-40"
              />
              <h2 className="mt-8 font-sans text-3xl font-black text-[#414296]">
                Acesso administrativo
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#5F5D70]">
                Entre com sua conta Google autorizada para gerenciar o conteudo do site.
              </p>
              <button
                type="button"
                onClick={handleLogin}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#00A859] sm:w-auto"
              >
                Entrar com Google
              </button>
            </div>
          </section>
        )}

        {access === "loading" && (
          <AdminNotice title="Carregando" text="Conferindo permissao administrativa." />
        )}

        {authReady && access === "denied" && (
          <AdminNotice
            title="Acesso nao autorizado"
            text={`Entre com ${primaryAdminEmail} ou peca para esse administrador liberar seu e-mail.`}
          />
        )}

        {access === "allowed" && (
          <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="h-fit border-2 border-[#E2E2EA] bg-white p-4">
              <div className="border-b border-[#E2E2EA] px-2 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00A859]">
                  Logado como
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-[#414296]">
                  {user?.email}
                </p>
              </div>

              <nav className="mt-4 grid gap-2">
                {[...adminPanels, ...(canManageAdmins ? [{ id: "admins", label: "Administradores", icon: UserPlus } as const] : [])].map(
                  (item) => {
                    const Icon = item.icon;
                    const active = panel === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPanel(item.id)}
                        className={[
                          "flex items-center gap-3 border-2 px-4 py-3 text-left text-sm font-semibold transition",
                          active
                            ? "border-[#414296] bg-[#414296] text-white"
                            : "border-transparent text-[#5F5D70] hover:border-[#E2E2EA] hover:text-[#414296]",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  },
                )}
              </nav>
            </aside>

            <div className="grid gap-8">
              {message && (
                <div className="border-2 border-[#0B86D8] bg-white p-5 text-sm font-semibold text-[#414296]">
                  {message}
                </div>
              )}

              {panel === "overview" && (
                <section className="grid gap-8">
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                      icon={CalendarDays}
                      label="Eventos cadastrados"
                      value={events.length}
                      tone="#0B86D8"
                    />
                    <StatCard
                      icon={CalendarDays}
                      label="Proximos eventos"
                      value={upcomingEvents.length}
                      tone="#00A859"
                    />
                    <StatCard
                      icon={FileText}
                      label="Paginas publicas"
                      value={publicPages.length}
                      tone="#F7A600"
                    />
                  </div>

                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <h2 className="font-sans text-3xl font-black text-[#414296]">
                      Atalhos de gestao
                    </h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <AdminShortcut
                        icon={CalendarDays}
                        title="Cadastrar evento"
                        text="Crie agenda, data, duracao, equipamentos e flyer."
                        onClick={() => setPanel("events")}
                      />
                      <AdminShortcut
                        icon={ClipboardList}
                        title="Organizar inscricoes"
                        text="Espaco preparado para oficinas, editais e formularios."
                        onClick={() => setPanel("registrations")}
                      />
                      <AdminShortcut
                        icon={FileText}
                        title="Revisar paginas"
                        text="Veja as paginas publicas e acompanhe o que falta virar editor."
                        onClick={() => setPanel("pages")}
                      />
                    </div>
                  </section>
                </section>
              )}

              {panel === "events" && (
                <section className="grid gap-8">
                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <div className="mb-8 flex items-center gap-3">
                      <CalendarDays className="h-6 w-6 text-[#0B86D8]" />
                      <h2 className="font-sans text-3xl font-black text-[#414296]">
                        Cadastrar evento
                      </h2>
                    </div>

                    <form onSubmit={handleCreateEvent} className="grid gap-5">
                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Qual e o nome do evento
                        <input
                          required
                          value={form.name}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, name: event.target.value }))
                          }
                          className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                        />
                      </label>

                      <div className="grid gap-5 md:grid-cols-3">
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Data
                          <input
                            required
                            type="date"
                            value={form.date}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, date: event.target.value }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Periodo
                          <input
                            required
                            min="1"
                            type="number"
                            value={form.periodAmount}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, periodAmount: event.target.value }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Unidade
                          <select
                            value={form.periodUnit}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                periodUnit: event.target.value as EventPeriodUnit,
                              }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                          >
                            <option value="horas">Horas</option>
                            <option value="dias">Dias</option>
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Qual secretaria
                        <select
                          value={form.secretary}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, secretary: event.target.value }))
                          }
                          className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                        >
                          {secretaryOptions.map((secretary) => (
                            <option key={secretary} value={secretary}>
                              {secretary}
                            </option>
                          ))}
                        </select>
                      </label>

                      <fieldset className="grid gap-3">
                        <legend className="text-sm font-semibold text-[#414296]">
                          Equipamentos necessarios
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {equipmentOptions.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 border-2 border-[#E2E2EA] px-4 py-3 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={form.equipment.includes(item)}
                                onChange={() => toggleEquipment(item)}
                                className="h-4 w-4"
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Flyer do evento
                        <span className="flex items-center gap-3 border-2 border-dashed border-[#BFC0D8] px-4 py-4 text-sm font-normal text-[#5F5D70]">
                          <Upload className="h-5 w-5 text-[#0B86D8]" />
                          <input
                            accept="image/*"
                            type="file"
                            onChange={(event) => setFlyer(event.target.files?.[0] ?? null)}
                            className="w-full"
                          />
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex w-fit items-center justify-center gap-2 bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#00A859] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Plus className="h-4 w-4" />
                        {saving ? "Salvando..." : "Cadastrar evento"}
                      </button>
                    </form>
                  </section>

                  <EventsList events={sortedEvents} onDelete={handleDeleteEvent} />
                </section>
              )}

              {panel === "registrations" && (
                <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-6 w-6 text-[#EF1B2D]" />
                    <h2 className="font-sans text-3xl font-black text-[#414296]">
                      Inscricoes
                    </h2>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5F5D70]">
                    Esta area esta pronta para concentrar oficinas, editais, formularios e
                    credenciamentos. No momento, a pagina publica de inscricoes ainda usa conteudo
                    fixo do site.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <AdminStatusCard title="Oficinas" text="Planejado para abrir e encerrar turmas." />
                    <AdminStatusCard title="Editais" text="Planejado para anexar documentos e prazos." />
                    <AdminStatusCard title="Formularios" text="Planejado para links externos ou formularios internos." />
                  </div>
                  <a
                    href="/inscricoes"
                    className="mt-8 inline-flex items-center gap-2 border-2 border-[#414296] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver pagina publica
                  </a>
                </section>
              )}

              {panel === "pages" && (
                <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-[#F7A600]" />
                    <h2 className="font-sans text-3xl font-black text-[#414296]">
                      Paginas do site
                    </h2>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5F5D70]">
                    Acompanhe as paginas publicas e acesse rapidamente cada uma. A edicao de texto
                    ainda esta no codigo, mas esta area ja deixa a gestao organizada para virar CMS.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {publicPages.map((page) => (
                      <article key={page.path} className="border-2 border-[#E2E2EA] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B86D8]">
                          {page.area}
                        </p>
                        <h3 className="mt-2 font-sans text-2xl font-black text-[#24223A]">
                          {page.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={page.path}
                            className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver
                          </a>
                          <span className="inline-flex items-center border-2 border-[#E2E2EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5F5D70]">
                            Conteudo fixo
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {panel === "admins" && canManageAdmins && (
                <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                  <h2 className="flex items-center gap-3 font-sans text-3xl font-black text-[#414296]">
                    <UserPlus className="h-6 w-6 text-[#00A859]" />
                    Administradores
                  </h2>
                  <form onSubmit={handleAddAdmin} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      className="border-2 border-[#E2E2EA] px-4 py-3 outline-none transition focus:border-[#00A859]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00A859] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#414296]"
                    >
                      Autorizar
                    </button>
                  </form>
                  <div className="mt-6 grid gap-2 text-sm text-[#5F5D70]">
                    <AdminRow email={primaryAdminEmail} fixed />
                    {admins.map((admin) => (
                      <AdminRow
                        key={admin.id}
                        email={admin.email}
                        onDelete={() => handleDeleteAdmin(admin.email)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>


    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="border-2 border-[#E2E2EA] bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5F5D70]">{label}</p>
        <Icon className="h-5 w-5" style={{ color: tone }} />
      </div>
      <p className="mt-5 font-sans text-5xl font-black text-[#24223A]">{value}</p>
    </article>
  );
}

function AdminShortcut({
  icon: Icon,
  onClick,
  text,
  title,
}: {
  icon: LucideIcon;
  onClick: () => void;
  text: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-[#E2E2EA] p-5 text-left transition hover:-translate-y-1 hover:border-[#414296] hover:shadow-[0_18px_40px_rgba(65,66,150,0.12)]"
    >
      <Icon className="h-6 w-6 text-[#0B86D8]" />
      <h3 className="mt-4 font-sans text-2xl font-black text-[#24223A]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#5F5D70]">{text}</p>
    </button>
  );
}

function AdminStatusCard({ text, title }: { text: string; title: string }) {
  return (
    <article className="border-2 border-[#E2E2EA] p-5">
      <h3 className="font-sans text-2xl font-black text-[#24223A]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#5F5D70]">{text}</p>
    </article>
  );
}

function EventsList({
  events,
  onDelete,
}: {
  events: CulturalEvent[];
  onDelete: (eventId: string) => void;
}) {
  return (
    <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
      <h2 className="font-sans text-3xl font-black text-[#414296]">Eventos cadastrados</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {events.length === 0 ? (
          <p className="text-sm text-[#5F5D70]">Nenhum evento cadastrado ainda.</p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="border-2 border-[#E2E2EA] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B86D8]">
                    {event.date}
                  </p>
                  <h3 className="mt-2 font-sans text-2xl font-black text-[#24223A]">
                    {event.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  aria-label={`Remover evento ${event.name}`}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#EF1B2D] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#5F5D70]">
                {event.periodAmount} {event.periodUnit} - {event.secretary}
              </p>
              {event.equipment.length > 0 && (
                <p className="mt-2 text-sm text-[#5F5D70]">
                  Equipamentos: {event.equipment.join(", ")}
                </p>
              )}
              {event.flyerUrl && (
                <a
                  href={event.flyerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver flyer
                </a>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function AdminNotice({ text, title }: { text: string; title: string }) {
  return (
    <section className="max-w-2xl border-2 border-[#E2E2EA] bg-white p-8">
      <h2 className="font-sans text-3xl font-black text-[#414296]">{title}</h2>
      <p className="mt-4 leading-relaxed text-[#5F5D70]">{text}</p>
    </section>
  );
}

function AdminRow({
  email,
  fixed = false,
  onDelete,
}: {
  email: string;
  fixed?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-[#E2E2EA] px-3 py-2">
      <span className="truncate">{email}</span>
      {fixed ? (
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00A859]">
          principal
        </span>
      ) : (
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-[#EF1B2D]">
          Remover
        </button>
      )}
    </div>
  );
}
