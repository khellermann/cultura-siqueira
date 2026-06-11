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
  getIdTokenResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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

import culturaLogo from "@/assets/cultura-logo-stacked.png";
import { uploadEventFlyer } from "@/lib/api/flyer.functions";
import { firebaseAuth, firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  adminUsersCollection,
  equipmentOptions,
  eventsCollection,
  formatEventSchedule,
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

const calendarWeekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] as const;
const calendarMonthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

type EventFormState = {
  allDay: boolean;
  date: string;
  description: string;
  endTime: string;
  equipment: string[];
  name: string;
  periodAmount: string;
  periodUnit: EventPeriodUnit;
  registrationEnabled: boolean;
  registrationUrl: string;
  secretary: string;
  startTime: string;
};

const initialEventForm: EventFormState = {
  allDay: false,
  date: "",
  description: "",
  endTime: "",
  equipment: [],
  name: "",
  periodAmount: "1",
  periodUnit: "horas",
  registrationEnabled: false,
  registrationUrl: "",
  secretary: secretaryOptions[0],
  startTime: "",
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

const maxFlyerSize = 5 * 1024 * 1024;

function getFirebaseErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : "";
  const detail = code || message ? ` Detalhe: ${[code, message].filter(Boolean).join(" - ")}` : "";

  if (code.includes("permission-denied") || code.includes("unauthorized")) {
    return `Sem permissao para salvar. Confira se o e-mail logado esta autorizado no Firebase e se as regras foram publicadas.${detail}`;
  }

  return `Nao foi possivel cadastrar o evento. Confira o Firebase e tente novamente.${detail}`;
}

function validateFlyer(file: File) {
  if (!file.type.startsWith("image/")) {
    return "O flyer precisa ser uma imagem.";
  }

  if (file.size > maxFlyerSize) {
    return "O flyer precisa ter ate 5 MB.";
  }

  return "";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(new Error("Nao foi possivel ler a imagem.")));
    reader.readAsDataURL(file);
  });
}

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
  const [tokenEmail, setTokenEmail] = useState("");
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

    const auth = firebaseAuth;
    if (!auth) return;

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccess("signed-out");
        return;
      }

      setAccess("loading");
      const allowed = await checkAdminAccess(currentUser);
      const token = await getIdTokenResult(currentUser, true);
      setTokenEmail(String(token.claims.email ?? ""));
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
    const auth = firebaseAuth;
    setMessage("");
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    try {
      await signInWithPopup(auth, provider);
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

  function hasAllDayConflict() {
    return events.some((event) => event.date === form.date && event.allDay);
  }

  function hasAnyEventOnSelectedDate() {
    return events.some((event) => event.date === form.date);
  }

  function handleFlyerChange(file: File | null) {
    if (!file) {
      setFlyer(null);
      return;
    }

    const validationMessage = validateFlyer(file);
    if (validationMessage) {
      setFlyer(null);
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setFlyer(file);
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !user?.email) return;

    if (!form.allDay && form.startTime && form.endTime && form.startTime >= form.endTime) {
      setMessage("O horario de fim precisa ser depois do horario de inicio.");
      return;
    }

    if (form.allDay && hasAnyEventOnSelectedDate()) {
      setMessage("Ja existe evento nesta data. Um evento de dia todo precisa de uma data livre.");
      return;
    }

    if (!form.allDay && hasAllDayConflict()) {
      setMessage("Esta data ja tem um evento de dia todo. Escolha outra data.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let flyerPath = "";

      if (flyer) {
        const dataUrl = await readFileAsDataUrl(flyer);
        const uploadedFlyer = await uploadEventFlyer({
          data: {
            dataUrl,
            fileName: flyer.name,
          },
        });
        flyerPath = uploadedFlyer.path;
      }

      await addDoc(collection(firebaseDb, eventsCollection), {
        allDay: form.allDay,
        createdAt: serverTimestamp(),
        createdBy: user.email,
        date: form.date,
        description: form.description.trim(),
        endTime: form.allDay ? "" : form.endTime,
        equipment: form.equipment,
        flyerPath,
        flyerUrl: flyerPath,
        name: form.name.trim(),
        periodAmount: Number(form.periodAmount),
        periodUnit: form.periodUnit,
        registrationEnabled: form.registrationEnabled,
        registrationUrl: form.registrationEnabled ? form.registrationUrl.trim() : "",
        secretary: form.secretary,
        startTime: form.allDay ? "" : form.startTime,
      });
      setForm(initialEventForm);
      setFlyer(null);
      setMessage("Evento cadastrado com sucesso.");
      await loadAdminData();
    } catch (error) {
      console.error(error);
      setMessage(getFirebaseErrorMessage(error));
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

                  <AdminCalendar events={upcomingEvents} />
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
                    <p className="mb-6 border-2 border-[#E2E2EA] bg-[#F8F8FB] px-4 py-3 text-sm font-semibold text-[#5F5D70]">
                      Salvando como: {user?.email ?? "usuario nao identificado"}
                      {tokenEmail && tokenEmail !== user?.email ? ` | Token: ${tokenEmail}` : ""}
                    </p>

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

                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Descricao do evento
                        <textarea
                          required
                          value={form.description}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, description: event.target.value }))
                          }
                          rows={4}
                          className="resize-y border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
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

                        <label className="flex items-center gap-3 border-2 border-[#E2E2EA] px-4 py-3 text-sm font-semibold text-[#414296]">
                          <input
                            type="checkbox"
                            checked={form.allDay}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, allDay: event.target.checked }))
                            }
                            className="h-4 w-4"
                          />
                          Evento de dia todo
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

                      <div className="grid gap-5 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Horario de inicio
                          <input
                            required={!form.allDay}
                            disabled={form.allDay}
                            type="time"
                            value={form.startTime}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, startTime: event.target.value }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8] disabled:bg-[#F1F1F6] disabled:text-[#8A8898]"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Horario de fim
                          <input
                            required={!form.allDay}
                            disabled={form.allDay}
                            type="time"
                            value={form.endTime}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, endTime: event.target.value }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8] disabled:bg-[#F1F1F6] disabled:text-[#8A8898]"
                          />
                        </label>
                      </div>

                      {form.date && hasAllDayConflict() && !form.allDay && (
                        <p className="border-2 border-[#EF1B2D] bg-white px-4 py-3 text-sm font-semibold text-[#EF1B2D]">
                          Esta data ja possui um evento de dia todo.
                        </p>
                      )}

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

                      <fieldset className="grid gap-4 border-2 border-[#E2E2EA] p-5">
                        <label className="flex items-center gap-3 text-sm font-semibold text-[#414296]">
                          <input
                            type="checkbox"
                            checked={form.registrationEnabled}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                registrationEnabled: event.target.checked,
                              }))
                            }
                            className="h-4 w-4"
                          />
                          Habilitar inscricao para este evento
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Link de inscricao
                          <input
                            disabled={!form.registrationEnabled}
                            required={form.registrationEnabled}
                            type="url"
                            placeholder="https://..."
                            value={form.registrationUrl}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, registrationUrl: event.target.value }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8] disabled:bg-[#F1F1F6] disabled:text-[#8A8898]"
                          />
                        </label>
                      </fieldset>

                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Flyer do evento
                        <span className="flex items-center gap-3 border-2 border-dashed border-[#BFC0D8] px-4 py-4 text-sm font-normal text-[#5F5D70]">
                          <Upload className="h-5 w-5 text-[#0B86D8]" />
                          <input
                            accept="image/*"
                            type="file"
                            onChange={(event) => handleFlyerChange(event.target.files?.[0] ?? null)}
                            className="w-full"
                          />
                        </span>
                        {flyer && (
                          <span className="text-xs font-normal text-[#5F5D70]">
                            Selecionado: {flyer.name} ({(flyer.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
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

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function getMonthLabel(monthDate: Date) {
  return `${calendarMonthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
}

function AdminCalendar({ events }: { events: CulturalEvent[] }) {
  const [monthDate, setMonthDate] = useState(() => {
    const firstEvent = events.find((event) => event.date);
    if (!firstEvent?.date) return new Date();
    const [year, month] = firstEvent.date.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const todayKey = formatDateKey(new Date());
  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  const cells = useMemo(() => createCalendarCells(monthDate), [monthDate]);
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CulturalEvent[]>>((current, event) => {
      if (!event.date) return current;
      current[event.date] = [...(current[event.date] ?? []), event].sort((a, b) =>
        formatEventSchedule(a).localeCompare(formatEventSchedule(b)),
      );
      return current;
    }, {});
  }, [events]);
  const visibleMonthEvents = events.filter((event) => event.date?.startsWith(monthKey)).length;

  function changeMonth(offset: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-[#0B86D8]" />
          <div>
            <h2 className="font-sans text-3xl font-black text-[#414296]">Calendario</h2>
            <p className="mt-1 text-sm text-[#5F5D70]">
              {visibleMonthEvents} evento{visibleMonthEvents === 1 ? "" : "s"} neste mes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mes anterior"
            className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#E2E2EA] text-[#414296] transition hover:border-[#414296]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-44 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#24223A]">
            {getMonthLabel(monthDate)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Proximo mes"
            className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#E2E2EA] text-[#414296] transition hover:border-[#414296]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#5F5D70]">Nenhum evento futuro cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[48rem]">
            <div className="grid grid-cols-7 border-l-2 border-t-2 border-[#E2E2EA]">
              {calendarWeekDays.map((day) => (
                <div
                  key={day}
                  className="border-b-2 border-r-2 border-[#E2E2EA] bg-[#F8F8FB] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#414296]"
                >
                  {day}
                </div>
              ))}
              {cells.map((date) => {
                const dateKey = formatDateKey(date);
                const dayEvents = eventsByDate[dateKey] ?? [];
                const isCurrentMonth = date.getMonth() === monthDate.getMonth();
                const isToday = dateKey === todayKey;

                return (
                  <article
                    key={dateKey}
                    className={[
                      "min-h-32 border-b-2 border-r-2 border-[#E2E2EA] p-3 transition",
                      isCurrentMonth ? "bg-white" : "bg-[#F8F8FB] text-[#8A8898]",
                      dayEvents.length > 0 ? "hover:bg-[#F8FBFF]" : "",
                    ].join(" ")}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className={[
                          "inline-flex h-7 w-7 items-center justify-center text-sm font-semibold",
                          isToday ? "bg-[#414296] text-white" : "text-[#24223A]",
                          !isCurrentMonth && !isToday ? "text-[#8A8898]" : "",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="rounded-full bg-[#0B86D8] px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-1.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="border-l-4 border-[#00A859] bg-[#F8FBFF] px-2 py-1.5"
                          title={`${event.name} - ${formatEventSchedule(event)}`}
                        >
                          <p className="truncate text-xs font-semibold text-[#24223A]">
                            {event.name}
                          </p>
                          <p className="truncate text-[0.68rem] text-[#5F5D70]">
                            {formatEventSchedule(event)}
                          </p>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[0.68rem] font-semibold text-[#414296]">
                          +{dayEvents.length - 3} evento{dayEvents.length - 3 === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {events
            .filter((event) => event.date?.startsWith(monthKey))
            .slice(0, 6)
            .map((event) => (
              <article key={event.id} className="border-2 border-[#E2E2EA] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B86D8]">
                  {event.date}
                </p>
                <h3 className="mt-2 font-semibold text-[#24223A]">{event.name}</h3>
                <p className="mt-1 text-sm text-[#5F5D70]">
                  {formatEventSchedule(event)} - {event.secretary}
                </p>
              </article>
            ))}
          {visibleMonthEvents === 0 && (
            <p className="text-sm text-[#5F5D70]">
              Nenhum evento neste mes. Use as setas para navegar por outros meses.
              </p>
          )}
        </div>
      )}
    </section>
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
                {formatEventSchedule(event)} - {event.secretary}
              </p>
              {event.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5F5D70]">
                  {event.description}
                </p>
              )}
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
