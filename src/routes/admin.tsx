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
  updateDoc,
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
  Bold,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Italic,
  LayoutDashboard,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  LogOut,
  Pencil,
  Plus,
  Quote,
  ShieldCheck,
  Trash2,
  Underline,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import culturaLogo from "@/assets/cultura-logo-stacked.png";
import { uploadPublicDocument } from "@/lib/api/document.functions";
import { uploadEventFlyer } from "@/lib/api/flyer.functions";
import { firebaseAuth, firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { richTextToPlainText, sanitizeRichText } from "@/lib/richText";
import {
  adminUsersCollection,
  equipmentOptions,
  eventsCollection,
  expandEventOccurrences,
  formatEventRecurrence,
  formatEventSchedule,
  formatEventVenue,
  isPrimaryAdmin,
  normalizeEmail,
  primaryAdminEmail,
  secretaryOptions,
  casaDaCulturaVenue,
  type AdminUser,
  type CulturalEvent,
  type EventPeriodUnit,
  type EventRecurrence,
  type EventVenueType,
  weekdayOptions,
} from "@/lib/events";
import {
  defaultMenuVisibility,
  mergeMenuVisibility,
  navigationSettingsDocId,
  publicPages,
  siteSettingsCollection,
} from "@/lib/siteSettings";
import {
  formatOpportunityType,
  getDefaultRegistrationFields,
  getOpportunityDocuments,
  getRegistrationSharePath,
  registrationFieldOptions,
  registrationOpportunitiesCollection,
  registrationOpportunityTypes,
  type RegistrationFieldConfig,
  type RegistrationFieldKey,
  registrationsCollection,
  type RegistrationEntry,
  type RegistrationOpportunity,
  type RegistrationOpportunityDocument,
  type RegistrationOpportunityType,
} from "@/lib/registrations";
import {
  visitRequestsCollection,
  type VisitRequest,
} from "@/lib/visitRequests";

type AdminAccess = "loading" | "allowed" | "denied" | "signed-out";
type AdminPanel =
  | "overview"
  | "events"
  | "registrations"
  | "edicts"
  | "submissions"
  | "visitRequests"
  | "pages"
  | "admins";

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
  recurrence: EventRecurrence;
  recurrenceEndDate: string;
  recurrenceWeekdays: number[];
  registrationEnabled: boolean;
  registrationUrl: string;
  secretary: string;
  startTime: string;
  venue: string;
  venueType: EventVenueType;
};

type OpportunityFormState = {
  active: boolean;
  bannerPath: string;
  bannerUrl: string;
  description: string;
  documents: RegistrationOpportunityDocument[];
  endDate: string;
  fields: RegistrationFieldConfig[];
  registrationUrl: string;
  startDate: string;
  title: string;
  type: RegistrationOpportunityType;
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
  recurrence: "none",
  recurrenceEndDate: "",
  recurrenceWeekdays: [],
  registrationEnabled: false,
  registrationUrl: "",
  secretary: secretaryOptions[0],
  startTime: "",
  venue: casaDaCulturaVenue,
  venueType: "casa-da-cultura",
};

const initialOpportunityForm: OpportunityFormState = {
  active: true,
  bannerPath: "",
  bannerUrl: "",
  description: "",
  documents: [],
  endDate: "",
  fields: getDefaultRegistrationFields("oficina"),
  registrationUrl: "",
  startDate: "",
  title: "",
  type: "oficina",
};

const adminPanels = [
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "events", label: "Eventos", icon: CalendarDays },
  { id: "registrations", label: "Cursos e oficinas", icon: ClipboardList },
  { id: "edicts", label: "Editais", icon: FileText },
  { id: "submissions", label: "Inscricoes recebidas", icon: Download },
  { id: "visitRequests", label: "Visitas", icon: CalendarDays },
  { id: "pages", label: "Paginas", icon: FileText },
] satisfies Array<{ id: AdminPanel; label: string; icon: LucideIcon }>;

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

function validatePdf(file: File) {
  if (file.type !== "application/pdf") {
    return "O documento precisa ser um PDF.";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "O PDF precisa ter ate 10 MB.";
  }

  return "";
}

function eventToFormState(event: CulturalEvent): EventFormState {
  return {
    allDay: Boolean(event.allDay),
    date: event.date,
    description: event.description ?? "",
    endTime: event.endTime ?? "",
    equipment: event.equipment ?? [],
    name: event.name,
    periodAmount: String(event.periodAmount ?? 1),
    periodUnit: event.periodUnit,
    recurrence: event.recurrence ?? "none",
    recurrenceEndDate: event.recurrenceEndDate ?? "",
    recurrenceWeekdays: event.recurrenceWeekdays ?? [],
    registrationEnabled: Boolean(event.registrationEnabled),
    registrationUrl: event.registrationUrl ?? "",
    secretary: event.secretary,
    startTime: event.startTime ?? "",
    venue: event.venue ?? casaDaCulturaVenue,
    venueType: event.venueType ?? "casa-da-cultura",
  };
}

function isCasaDaCulturaEvent(event: Pick<CulturalEvent, "venue" | "venueType">) {
  return (event.venueType ?? "casa-da-cultura") === "casa-da-cultura";
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
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
  const normalizedEmail = normalizeEmail(user.email);
  if (isPrimaryAdmin(normalizedEmail)) return true;
  try {
    const directAdminDoc = await getDoc(doc(firebaseDb, adminUsersCollection, user.email));
    if (directAdminDoc.exists()) return true;

    if (normalizedEmail === user.email) return false;
    const normalizedAdminDoc = await getDoc(doc(firebaseDb, adminUsersCollection, normalizedEmail));
    return normalizedAdminDoc.exists();
  } catch (error) {
    console.error(error);
    return false;
  }
}

function Admin() {
  const [access, setAccess] = useState<AdminAccess>("loading");
  const [adminEmail, setAdminEmail] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [editingEventId, setEditingEventId] = useState("");
  const [flyer, setFlyer] = useState<File | null>(null);
  const [form, setForm] = useState<EventFormState>(initialEventForm);
  const [menuVisibility, setMenuVisibility] = useState(defaultMenuVisibility);
  const [message, setMessage] = useState("");
  const [editingOpportunityId, setEditingOpportunityId] = useState("");
  const [opportunityBanner, setOpportunityBanner] = useState<File | null>(null);
  const [opportunityDocuments, setOpportunityDocuments] = useState<File[]>([]);
  const [opportunities, setOpportunities] = useState<RegistrationOpportunity[]>([]);
  const [opportunityForm, setOpportunityForm] =
    useState<OpportunityFormState>(initialOpportunityForm);
  const [panel, setPanel] = useState<AdminPanel>("overview");
  const [registrationEntries, setRegistrationEntries] = useState<RegistrationEntry[]>([]);
  const [selectedSubmissionOpportunityId, setSelectedSubmissionOpportunityId] = useState("");
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const canManageAdmins = isPrimaryAdmin(user?.email);
  const authReady = isFirebaseConfigured && firebaseAuth && firebaseDb;

  async function loadAdminData() {
    if (!firebaseDb) return;

    const [
      adminsSnapshot,
      eventsSnapshot,
      opportunitiesSnapshot,
      registrationsSnapshot,
      visitRequestsSnapshot,
    ] =
      await Promise.all([
        getDocs(query(collection(firebaseDb, adminUsersCollection), orderBy("email", "asc"))),
        getDocs(query(collection(firebaseDb, eventsCollection), orderBy("date", "desc"))),
        getDocs(
          query(
            collection(firebaseDb, registrationOpportunitiesCollection),
            orderBy("title", "asc"),
          ),
        ),
        getDocs(
          query(collection(firebaseDb, registrationsCollection), orderBy("createdAt", "desc")),
        ),
        getDocs(
          query(collection(firebaseDb, visitRequestsCollection), orderBy("createdAt", "desc")),
        ),
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

    setOpportunities(
      opportunitiesSnapshot.docs.map((opportunityDoc) => ({
        id: opportunityDoc.id,
        ...(opportunityDoc.data() as Omit<RegistrationOpportunity, "id">),
      })),
    );

    setRegistrationEntries(
      registrationsSnapshot.docs.map((registrationDoc) => ({
        id: registrationDoc.id,
        ...(registrationDoc.data() as Omit<RegistrationEntry, "id">),
      })),
    );

    setVisitRequests(
      visitRequestsSnapshot.docs.map((visitRequestDoc) => ({
        id: visitRequestDoc.id,
        ...(visitRequestDoc.data() as Omit<VisitRequest, "id">),
      })),
    );

    try {
      const navigationSnapshot = await getDoc(
        doc(firebaseDb, siteSettingsCollection, navigationSettingsDocId),
      );
      setMenuVisibility(
        navigationSnapshot.exists()
          ? mergeMenuVisibility(navigationSnapshot.data().items as Record<string, unknown> | undefined)
          : defaultMenuVisibility,
      );
    } catch (error) {
      console.error(error);
      setMenuVisibility(defaultMenuVisibility);
    }
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

  useEffect(() => {
    if (editingOpportunityId) return;
    if (panel === "edicts" && opportunityForm.type !== "edital") {
      setOpportunityForm(createOpportunityForm("edital"));
      setOpportunityBanner(null);
      setOpportunityDocuments([]);
    }
    if (panel === "registrations" && opportunityForm.type === "edital") {
      setOpportunityForm(createOpportunityForm("oficina"));
      setOpportunityBanner(null);
      setOpportunityDocuments([]);
    }
  }, [editingOpportunityId, opportunityForm.type, panel]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );
  const upcomingEvents = useMemo(
    () => {
      const today = formatDateKey(new Date());
      const rangeEnd = formatDateKey(addCalendarDays(new Date(), 180));
      return expandEventOccurrences(events, today, rangeEnd).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    },
    [events],
  );
  const publicOrigin = typeof window === "undefined" ? "" : window.location.origin;
  const edicts = useMemo(
    () => opportunities.filter((opportunity) => opportunity.type === "edital"),
    [opportunities],
  );
  const courseOpportunities = useMemo(
    () => opportunities.filter((opportunity) => opportunity.type !== "edital"),
    [opportunities],
  );
  const selectedSubmissionOpportunity = useMemo(
    () =>
      opportunities.find((opportunity) => opportunity.id === selectedSubmissionOpportunityId) ??
      opportunities[0],
    [opportunities, selectedSubmissionOpportunityId],
  );
  const selectedSubmissionEntries = useMemo(
    () =>
      selectedSubmissionOpportunity
        ? registrationEntries.filter(
            (entry) => entry.opportunityId === selectedSubmissionOpportunity.id,
          )
        : [],
    [registrationEntries, selectedSubmissionOpportunity],
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

  function toggleRecurrenceWeekday(weekday: number) {
    setForm((current) => ({
      ...current,
      recurrenceWeekdays: current.recurrenceWeekdays.includes(weekday)
        ? current.recurrenceWeekdays.filter((selected) => selected !== weekday)
        : [...current.recurrenceWeekdays, weekday].sort((a, b) => a - b),
    }));
  }

  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId),
    [editingEventId, events],
  );
  const isEditingEvent = Boolean(editingEventId);

  function getCasaDaCulturaConflict() {
    if (form.venueType !== "casa-da-cultura" || !form.date) return undefined;

    const rangeEnd = form.recurrence === "weekly" ? form.recurrenceEndDate || form.date : form.date;
    const formEvent: CulturalEvent = {
      id: editingEventId || "novo-evento",
      allDay: form.allDay,
      date: form.date,
      description: form.description,
      endTime: form.allDay ? "" : form.endTime,
      equipment: form.equipment,
      name: form.name,
      periodAmount: Number(form.periodAmount || 1),
      periodUnit: form.periodUnit,
      recurrence: form.recurrence,
      recurrenceEndDate: form.recurrence === "weekly" ? form.recurrenceEndDate : "",
      recurrenceWeekdays: form.recurrence === "weekly" ? form.recurrenceWeekdays : [],
      secretary: form.secretary,
      startTime: form.allDay ? "" : form.startTime,
      venue: form.venue,
      venueType: form.venueType,
    };
    const formOccurrences = expandEventOccurrences([formEvent], form.date, rangeEnd);
    const existingOccurrences = expandEventOccurrences(
      events.filter((event) => event.id !== editingEventId && isCasaDaCulturaEvent(event)),
      form.date,
      rangeEnd,
    );

    return existingOccurrences.find((event) => {
      const formOccurrence = formOccurrences.find((occurrence) => {
        if (occurrence.date !== event.date) return false;
        if (occurrence.allDay || event.allDay) return true;
        if (!occurrence.startTime || !occurrence.endTime || !event.startTime || !event.endTime) {
          return false;
        }

        return timeRangesOverlap(occurrence.startTime, occurrence.endTime, event.startTime, event.endTime);
      });

      return Boolean(formOccurrence);
    });
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

  function handleOpportunityBannerChange(file: File | null) {
    if (!file) {
      setOpportunityBanner(null);
      return;
    }

    const validationMessage = validateFlyer(file);
    if (validationMessage) {
      setOpportunityBanner(null);
      setMessage(validationMessage.replace("flyer", "banner"));
      return;
    }

    setMessage("");
    setOpportunityBanner(file);
  }

  function handleOpportunityDocumentsChange(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) {
      setOpportunityDocuments([]);
      return;
    }

    const validationMessage = selectedFiles.map(validatePdf).find(Boolean);
    if (validationMessage) {
      setOpportunityDocuments([]);
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setOpportunityDocuments(selectedFiles);
  }

  function createOpportunityForm(type: RegistrationOpportunityType): OpportunityFormState {
    return {
      ...initialOpportunityForm,
      fields: getDefaultRegistrationFields(type),
      type,
    };
  }

  function resetOpportunityForm(type: RegistrationOpportunityType) {
    setEditingOpportunityId("");
    setOpportunityBanner(null);
    setOpportunityDocuments([]);
    setOpportunityForm(createOpportunityForm(type));
  }

  function toggleOpportunityField(fieldKey: RegistrationFieldKey) {
    const option = registrationFieldOptions.find((field) => field.key === fieldKey);
    if (!option) return;

    setOpportunityForm((current) => {
      const exists = current.fields.some((field) => field.key === fieldKey);
      return {
        ...current,
        fields: exists
          ? current.fields.filter((field) => field.key !== fieldKey)
          : [...current.fields, { ...option }],
      };
    });
  }

  function toggleOpportunityFieldRequired(fieldKey: RegistrationFieldKey) {
    setOpportunityForm((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.key === fieldKey ? { ...field, required: !field.required } : field,
      ),
    }));
  }

  function handleEditEvent(event: CulturalEvent) {
    setEditingEventId(event.id);
    setForm(eventToFormState(event));
    setFlyer(null);
    setPanel("events");
    setMessage(`Editando evento: ${event.name}`);
  }

  function handleCancelEdit() {
    setEditingEventId("");
    setForm(initialEventForm);
    setFlyer(null);
    setMessage("");
  }

  async function handleSaveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !user?.email) return;

    if (!form.allDay && form.startTime && form.endTime && form.startTime >= form.endTime) {
      setMessage("O horario de fim precisa ser depois do horario de inicio.");
      return;
    }

    if (form.venueType === "outro" && !form.venue.trim()) {
      setMessage("Informe onde sera o evento.");
      return;
    }

    if (form.recurrence === "weekly") {
      if (form.recurrenceWeekdays.length === 0) {
        setMessage("Selecione pelo menos um dia da semana para repetir o evento.");
        return;
      }

      if (!form.recurrenceEndDate || form.recurrenceEndDate < form.date) {
        setMessage("Informe uma data final igual ou posterior a data inicial da recorrencia.");
        return;
      }
    }

    const casaDaCulturaConflict = getCasaDaCulturaConflict();
    if (casaDaCulturaConflict) {
      setMessage(
        `Ja existe evento na Casa da Cultura neste horario: ${casaDaCulturaConflict.name} (${formatEventSchedule(casaDaCulturaConflict)}).`,
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const descriptionHtml = sanitizeRichText(form.description);

      if (!richTextToPlainText(descriptionHtml)) {
        setMessage("Informe a descricao do evento.");
        setSaving(false);
        return;
      }

      let flyerPath = editingEvent?.flyerPath ?? "";
      let flyerUrl = editingEvent?.flyerUrl ?? "";

      if (flyer) {
        const dataUrl = await readFileAsDataUrl(flyer);
        const uploadedFlyer = await uploadEventFlyer({
          data: {
            dataUrl,
            fileName: flyer.name,
          },
        });
        flyerPath = uploadedFlyer.path;
        flyerUrl = uploadedFlyer.path;
      }

      const eventPayload = {
        allDay: form.allDay,
        date: form.date,
        description: descriptionHtml,
        endTime: form.allDay ? "" : form.endTime,
        equipment: form.equipment,
        flyerPath,
        flyerUrl,
        name: form.name.trim(),
        periodAmount: Number(form.periodAmount),
        periodUnit: form.periodUnit,
        recurrence: form.recurrence,
        recurrenceEndDate: form.recurrence === "weekly" ? form.recurrenceEndDate : "",
        recurrenceWeekdays: form.recurrence === "weekly" ? form.recurrenceWeekdays : [],
        registrationEnabled: form.registrationEnabled,
        registrationUrl: form.registrationEnabled ? form.registrationUrl.trim() : "",
        secretary: form.secretary,
        startTime: form.allDay ? "" : form.startTime,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
        venue: form.venueType === "casa-da-cultura" ? casaDaCulturaVenue : form.venue.trim(),
        venueType: form.venueType,
      };

      if (editingEventId) {
        await updateDoc(doc(firebaseDb, eventsCollection, editingEventId), eventPayload);
      } else {
        await addDoc(collection(firebaseDb, eventsCollection), {
          ...eventPayload,
          createdAt: serverTimestamp(),
          createdBy: user.email,
        });
      }

      setForm(initialEventForm);
      setEditingEventId("");
      setFlyer(null);
      setMessage(editingEventId ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.");
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

    const typedEmail = adminEmail.trim();
    const email = normalizeEmail(adminEmail);
    if (!email) return;

    await setDoc(doc(firebaseDb, adminUsersCollection, email), {
      createdAt: serverTimestamp(),
      createdBy: user.email,
      email,
      originalEmail: typedEmail,
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
    if (editingEventId === eventId) handleCancelEdit();
    setMessage("Evento removido.");
    await loadAdminData();
  }

  async function handleSaveOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseDb || !user?.email) return;

    const title = opportunityForm.title.trim();
    if (!title) {
      setMessage("Informe o nome da oficina, curso ou evento.");
      return;
    }

    if (
      opportunityForm.type === "edital" &&
      opportunityForm.documents.length === 0 &&
      opportunityDocuments.length === 0
    ) {
      setMessage("Envie pelo menos um anexo em PDF para o edital.");
      return;
    }

    if (opportunityForm.type === "edital" && opportunityForm.fields.length === 0) {
      setMessage("Selecione pelo menos um campo para o formulario do edital.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let bannerPath = opportunityForm.bannerPath;
      let bannerUrl = opportunityForm.bannerUrl;

      if (opportunityBanner) {
        const dataUrl = await readFileAsDataUrl(opportunityBanner);
        const uploadedBanner = await uploadEventFlyer({
          data: {
            dataUrl,
            fileName: opportunityBanner.name,
          },
        });
        bannerPath = uploadedBanner.path;
        bannerUrl = uploadedBanner.path;
      }

      const uploadedDocuments = await Promise.all(
        opportunityDocuments.map(async (documentFile) => {
          const dataUrl = await readFileAsDataUrl(documentFile);
          const uploadedDocument = await uploadPublicDocument({
            data: {
              dataUrl,
              fileName: documentFile.name,
            },
          });

          return {
            name: documentFile.name,
            path: uploadedDocument.path,
            url: uploadedDocument.path,
          };
        }),
      );
      const documents = [...opportunityForm.documents, ...uploadedDocuments];
      const mainDocument = documents[0];

      const opportunityPayload = {
        active: opportunityForm.active,
        bannerPath,
        bannerUrl,
        description: opportunityForm.description.trim(),
        documents,
        documentPath: mainDocument?.path ?? "",
        documentUrl: mainDocument?.url ?? "",
        endDate: opportunityForm.endDate,
        fields: opportunityForm.fields.length
          ? opportunityForm.fields
          : getDefaultRegistrationFields(opportunityForm.type),
        registrationUrl: opportunityForm.registrationUrl.trim(),
        startDate: opportunityForm.startDate,
        title,
        type: opportunityForm.type,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      };

      if (editingOpportunityId) {
        await updateDoc(
          doc(firebaseDb, registrationOpportunitiesCollection, editingOpportunityId),
          opportunityPayload,
        );
      } else {
        await addDoc(collection(firebaseDb, registrationOpportunitiesCollection), {
          ...opportunityPayload,
          createdAt: serverTimestamp(),
          createdBy: user.email,
        });
      }

      setOpportunityForm(createOpportunityForm(opportunityForm.type));
      setEditingOpportunityId("");
      setOpportunityBanner(null);
      setOpportunityDocuments([]);
      setMessage(
        editingOpportunityId
          ? "Atividade de inscricao atualizada."
          : "Atividade de inscricao cadastrada.",
      );
      await loadAdminData();
    } catch (error) {
      console.error(error);
      setMessage(getFirebaseErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function handleEditOpportunity(opportunity: RegistrationOpportunity) {
    setEditingOpportunityId(opportunity.id);
    setOpportunityBanner(null);
    setOpportunityDocuments([]);
    setOpportunityForm({
      active: opportunity.active !== false,
      bannerPath: opportunity.bannerPath ?? "",
      bannerUrl: opportunity.bannerUrl ?? "",
      description: opportunity.description ?? "",
      documents: getOpportunityDocuments(opportunity),
      endDate: opportunity.endDate ?? "",
      fields: opportunity.fields?.length
        ? opportunity.fields
        : getDefaultRegistrationFields(opportunity.type ?? "oficina"),
      registrationUrl: opportunity.registrationUrl ?? "",
      startDate: opportunity.startDate ?? "",
      title: opportunity.title ?? "",
      type: opportunity.type ?? "oficina",
    });
    setPanel((opportunity.type ?? "oficina") === "edital" ? "edicts" : "registrations");
  }

  function handleCancelOpportunityEdit() {
    setEditingOpportunityId("");
    setOpportunityForm(createOpportunityForm(opportunityForm.type));
    setOpportunityBanner(null);
    setOpportunityDocuments([]);
  }

  async function handleDeleteOpportunity(opportunityId: string) {
    if (!firebaseDb) return;
    await deleteDoc(doc(firebaseDb, registrationOpportunitiesCollection, opportunityId));
    if (editingOpportunityId === opportunityId) handleCancelOpportunityEdit();
    setMessage("Atividade de inscricao removida.");
    await loadAdminData();
  }

  async function handleDeleteRegistration(registrationId: string) {
    if (!firebaseDb) return;
    await deleteDoc(doc(firebaseDb, registrationsCollection, registrationId));
    setMessage("Inscricao removida.");
    await loadAdminData();
  }

  async function handleDeleteVisitRequest(requestId: string) {
    if (!firebaseDb) return;
    await deleteDoc(doc(firebaseDb, visitRequestsCollection, requestId));
    setMessage("Solicitação de visita removida.");
    await loadAdminData();
  }

  function getEntryValue(entry: RegistrationEntry, fieldKey: string) {
    const formValue = entry.formData?.[fieldKey];
    if (formValue) return formValue;
    return String((entry as unknown as Record<string, unknown>)[fieldKey] ?? "");
  }

  function getSubmissionFields(opportunity?: RegistrationOpportunity) {
    return opportunity?.fields?.length
      ? opportunity.fields
      : getDefaultRegistrationFields(opportunity?.type ?? "oficina");
  }

  function downloadTextFile(fileName: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportSelectedSubmissions(format: "csv" | "doc" | "pdf") {
    if (!selectedSubmissionOpportunity) return;
    const fields = getSubmissionFields(selectedSubmissionOpportunity);
    const title = selectedSubmissionOpportunity.title.replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
    const rows = selectedSubmissionEntries.map((entry) => [
      entry.id,
      ...fields.map((field) => getEntryValue(entry, field.key)),
    ]);

    if (format === "csv") {
      const csvRows = [
        ["Comprovante", ...fields.map((field) => field.label)],
        ...rows,
      ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"));
      downloadTextFile(`inscricoes-${title}.csv`, csvRows.join("\n"), "text/csv;charset=utf-8");
      return;
    }

    const tableRows = rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td style="border:1px solid #999;padding:6px">${String(cell)}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Inscricoes</title></head><body><h1>${selectedSubmissionOpportunity.title}</h1><table style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid #999;padding:6px">Comprovante</th>${fields
      .map((field) => `<th style="border:1px solid #999;padding:6px">${field.label}</th>`)
      .join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

    if (format === "doc") {
      downloadTextFile(`inscricoes-${title}.doc`, html, "application/msword;charset=utf-8");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  }

  async function handleToggleMenuItem(path: string) {
    if (!firebaseDb || !user?.email) return;

    const nextVisibility = {
      ...menuVisibility,
      [path]: menuVisibility[path] === false,
    };

    setMenuVisibility(nextVisibility);
    setSavingMenu(true);
    setMessage("");

    try {
      await setDoc(
        doc(firebaseDb, siteSettingsCollection, navigationSettingsDocId),
        {
          items: nextVisibility,
          updatedAt: serverTimestamp(),
          updatedBy: user.email,
        },
        { merge: true },
      );
      setMessage("Menu atualizado.");
    } catch (error) {
      console.error(error);
      setMenuVisibility(menuVisibility);
      setMessage(getFirebaseErrorMessage(error));
    } finally {
      setSavingMenu(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <main
        className={
          access === "allowed"
            ? "min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8"
            : "mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16"
        }
      >
        {access === "allowed" && (
          <div className="mb-6 flex flex-col gap-5 border-b border-[#E2E2EA] bg-[#F8F8FB] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#00A859]">
                <ShieldCheck className="h-4 w-4" />
                Area administrativa
              </p>
              <h1 className="mt-3 font-sans text-3xl font-black tracking-normal text-[#414296] md:text-5xl">
                Painel administrativo
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5F5D70] md:text-base">
                Gerencie eventos, inscrições, páginas do site e usuários autorizados em um só lugar.
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
                Entre com a conta Google que foi autorizada na lista de administradores.
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
          <AdminNotice title="Carregando" text="Conferindo permissão administrativa." />
        )}

        {authReady && access === "denied" && (
          <AdminNotice
            title="Acesso nao autorizado"
            text={`Voce entrou com ${tokenEmail || user?.email || "um e-mail nao identificado"}. Entre com ${primaryAdminEmail} ou confira se este e-mail esta cadastrado exatamente em Administradores.`}
          />
        )}

        {access === "allowed" && (
          <div className="grid min-h-[calc(100vh-12rem)] gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="h-fit border-2 border-[#E2E2EA] bg-white p-4 lg:sticky lg:top-6">
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

            <div className="grid min-w-0 gap-6">
              {message && (
                <div className="border-2 border-[#0B86D8] bg-white p-5 text-sm font-semibold text-[#414296]">
                  {message}
                </div>
              )}

              {panel === "overview" && (
                <section className="grid gap-8">
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                      icon={CalendarDays}
                      label="Eventos cadastrados"
                      value={events.length}
                      tone="#0B86D8"
                    />
                    <StatCard
                      icon={CalendarDays}
                      label="Próximos eventos"
                      value={upcomingEvents.length}
                      tone="#00A859"
                    />
                    <StatCard
                      icon={ClipboardList}
                      label="Inscrições recebidas"
                      value={registrationEntries.length}
                      tone="#F7A600"
                    />
                    <StatCard
                      icon={CalendarDays}
                      label="Visitas solicitadas"
                      value={visitRequests.length}
                      tone="#EF1B2D"
                    />
                  </div>

                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <h2 className="font-sans text-3xl font-black text-[#414296]">
                      Atalhos de gestão
                    </h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      <AdminShortcut
                        icon={CalendarDays}
                        title="Cadastrar evento"
                        text="Crie agenda, data, duracao, equipamentos e flyer."
                        onClick={() => setPanel("events")}
                      />
                      <AdminShortcut
                        icon={ClipboardList}
                        title="Organizar inscrições"
                        text="Cadastre oficinas, cursos e eventos com link publico de inscrição."
                        onClick={() => setPanel("registrations")}
                      />
                      <AdminShortcut
                        icon={CalendarDays}
                        title="Solicitações de visita"
                        text="Veja escolas e grupos que pediram agendamento pelo site."
                        onClick={() => setPanel("visitRequests")}
                      />
                      <AdminShortcut
                        icon={FileText}
                        title="Revisar páginas"
                        text="Veja as páginas públicas e acompanhe o que falta virar editor."
                        onClick={() => setPanel("pages")}
                      />
                    </div>
                  </section>

                  <AdminCalendar events={upcomingEvents} />
                </section>
              )}

              {panel === "events" && (
                <section className="grid gap-8">
                  {isEditingEvent && <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" />}
                  <section
                    className={[
                      "border-2 border-[#E2E2EA] bg-white p-6 md:p-8",
                      isEditingEvent
                        ? "fixed inset-x-4 top-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:inset-x-10 lg:left-1/2 lg:right-auto lg:w-[min(58rem,calc(100vw-5rem))] lg:-translate-x-1/2"
                        : "",
                    ].join(" ")}
                  >
                    <div className="mb-8 flex items-center gap-3">
                      <CalendarDays className="h-6 w-6 text-[#0B86D8]" />
                      <h2 className="font-sans text-3xl font-black text-[#414296]">
                        {isEditingEvent ? "Editar evento" : "Cadastrar evento"}
                      </h2>
                    </div>

                    {isEditingEvent && (
                      <p className="mb-6 border-2 border-[#F7A600] bg-[#FFF9E8] px-4 py-3 text-sm font-semibold text-[#414296]">
                        Você está editando um evento existente. Para manter o flyer atual, deixe o
                        campo de arquivo sem selecionar.
                      </p>
                    )}

                    <form onSubmit={handleSaveEvent} className="grid gap-5">
                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Qual é o nome do evento
                        <input
                          required
                          value={form.name}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, name: event.target.value }))
                          }
                          className="border-2 border-[#E2E2EA] px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                        />
                      </label>

                      <RichTextEditor
                        label="Descrição do evento"
                        value={form.description}
                        onChange={(description) =>
                          setForm((current) => ({ ...current, description }))
                        }
                      />

                      <div className="grid gap-4 border-2 border-[#E2E2EA] bg-[#F8F8FB] p-4">
                        <p className="text-sm font-semibold text-[#414296]">Local do evento</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="flex items-center gap-3 border-2 border-[#D8D8E8] bg-white px-4 py-3 text-sm font-semibold text-[#414296]">
                            <input
                              type="radio"
                              name="venueType"
                              checked={form.venueType === "casa-da-cultura"}
                              onChange={() =>
                                setForm((current) => ({
                                  ...current,
                                  venue: casaDaCulturaVenue,
                                  venueType: "casa-da-cultura",
                                }))
                              }
                              className="h-4 w-4"
                            />
                            Casa da Cultura
                          </label>
                          <label className="flex items-center gap-3 border-2 border-[#D8D8E8] bg-white px-4 py-3 text-sm font-semibold text-[#414296]">
                            <input
                              type="radio"
                              name="venueType"
                              checked={form.venueType === "outro"}
                              onChange={() =>
                                setForm((current) => ({
                                  ...current,
                                  venue: current.venueType === "outro" ? current.venue : "",
                                  venueType: "outro",
                                }))
                              }
                              className="h-4 w-4"
                            />
                            Outro local
                          </label>
                        </div>
                        {form.venueType === "outro" && (
                          <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                            Onde será o evento
                            <input
                              required
                              value={form.venue}
                              onChange={(event) =>
                                setForm((current) => ({ ...current, venue: event.target.value }))
                              }
                              placeholder="Ex.: Praça central, escola, auditorio..."
                              className="border-2 border-[#E2E2EA] bg-white px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                            />
                          </label>
                        )}
                      </div>

                      <div className="grid gap-5 md:grid-cols-3">
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Data
                          <input
                            required
                            type="date"
                            value={form.date}
                            onChange={(event) => {
                              const date = event.target.value;
                              const weekday = date ? new Date(`${date}T00:00:00`).getDay() : undefined;
                              setForm((current) => ({
                                ...current,
                                date,
                                recurrenceWeekdays:
                                  current.recurrence === "weekly" &&
                                  current.recurrenceWeekdays.length === 0 &&
                                  weekday !== undefined
                                    ? [weekday]
                                    : current.recurrenceWeekdays,
                              }));
                            }}
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
                          Período
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

                      <div className="grid gap-4 border-2 border-[#E2E2EA] bg-[#F8F8FB] p-4">
                        <label className="flex items-center gap-3 text-sm font-semibold text-[#414296]">
                          <input
                            type="checkbox"
                            checked={form.recurrence === "weekly"}
                            onChange={(event) =>
                              setForm((current) => {
                                const enabled = event.target.checked;
                                const selectedDateWeekday = current.date
                                  ? new Date(`${current.date}T00:00:00`).getDay()
                                  : undefined;

                                return {
                                  ...current,
                                  recurrence: enabled ? "weekly" : "none",
                                  recurrenceEndDate: enabled ? current.recurrenceEndDate : "",
                                  recurrenceWeekdays: enabled
                                    ? current.recurrenceWeekdays.length > 0
                                      ? current.recurrenceWeekdays
                                      : selectedDateWeekday !== undefined
                                        ? [selectedDateWeekday]
                                        : []
                                    : [],
                                };
                              })
                            }
                            className="h-4 w-4"
                          />
                          Repetir semanalmente
                        </label>

                        {form.recurrence === "weekly" && (
                          <div className="grid gap-4">
                            <div className="flex flex-wrap gap-2">
                              {weekdayOptions.map((weekday) => (
                                <button
                                  key={weekday.value}
                                  type="button"
                                  onClick={() => toggleRecurrenceWeekday(weekday.value)}
                                  className={[
                                    "border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                    form.recurrenceWeekdays.includes(weekday.value)
                                      ? "border-[#414296] bg-[#414296] text-white"
                                      : "border-[#D8D8E8] bg-white text-[#414296] hover:border-[#414296]",
                                  ].join(" ")}
                                >
                                  {weekday.shortLabel}
                                </button>
                              ))}
                            </div>
                            <label className="grid gap-2 text-sm font-semibold text-[#414296] md:max-w-xs">
                              Repetir ate
                              <input
                                required
                                min={form.date}
                                type="date"
                                value={form.recurrenceEndDate}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    recurrenceEndDate: event.target.value,
                                  }))
                                }
                                className="border-2 border-[#E2E2EA] bg-white px-4 py-3 font-normal text-[#24223A] outline-none transition focus:border-[#0B86D8]"
                              />
                            </label>
                          </div>
                        )}
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

                      {getCasaDaCulturaConflict() && (
                        <p className="border-2 border-[#EF1B2D] bg-white px-4 py-3 text-sm font-semibold text-[#EF1B2D]">
                          Existe conflito de agenda na Casa da Cultura com{" "}
                          {getCasaDaCulturaConflict()?.name}.
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
                        {isEditingEvent && !flyer && editingEvent?.flyerUrl && (
                          <span className="text-xs font-normal text-[#5F5D70]">
                            Flyer atual sera mantido.
                          </span>
                        )}
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex w-fit items-center justify-center gap-2 bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#00A859] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isEditingEvent ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {saving ? "Salvando..." : isEditingEvent ? "Salvar alteracoes" : "Cadastrar evento"}
                        </button>
                        {isEditingEvent && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="inline-flex w-fit items-center justify-center gap-2 border-2 border-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar edicao
                          </button>
                        )}
                      </div>
                    </form>
                  </section>

                  <EventsList events={sortedEvents} onDelete={handleDeleteEvent} onEdit={handleEditEvent} />
                </section>
              )}

              {(panel === "registrations" || panel === "edicts") && (
                <section className="grid gap-8">
                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-6 w-6 text-[#EF1B2D]" />
                      <h2 className="font-sans text-3xl font-black text-[#414296]">
                        {panel === "edicts" ? "Editais" : "Cursos, oficinas e eventos"}
                      </h2>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5F5D70]">
                      {panel === "edicts"
                        ? "Cadastre editais, anexe o PDF, configure o formulario e divulgue o link de inscricao."
                        : "Cadastre oficinas, cursos ou eventos com inscricao aberta. Cada atividade ganha um link direto para divulgacao."}
                    </p>

                    <form onSubmit={handleSaveOpportunity} className="mt-8 grid gap-5">
                      <div className="grid gap-5 md:grid-cols-3">
                        <label className="grid gap-2 text-sm font-semibold text-[#414296] md:col-span-2">
                          {panel === "edicts" ? "Titulo do edital" : "Nome da atividade"}
                          <input
                            value={opportunityForm.title}
                            onChange={(event) =>
                              setOpportunityForm((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                            placeholder={panel === "edicts" ? "Ex.: Edital de fomento cultural" : "Ex.: Oficina de desenho"}
                            required
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Tipo
                          <select
                            value={opportunityForm.type}
                            onChange={(event) =>
                              setOpportunityForm((current) => {
                                const type = event.target.value as RegistrationOpportunityType;
                                return {
                                  ...current,
                                  fields: getDefaultRegistrationFields(type),
                                  type,
                                };
                              })
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          >
                            {registrationOpportunityTypes
                              .filter((type) => (panel === "edicts" ? type === "edital" : type !== "edital"))
                              .map((type) => (
                              <option key={type} value={type}>
                                {formatOpportunityType(type)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                        Descricao curta
                        <textarea
                          value={opportunityForm.description}
                          onChange={(event) =>
                            setOpportunityForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="min-h-28 border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          placeholder="Informe detalhes importantes para quem vai se inscrever."
                        />
                      </label>

                      {panel === "edicts" && (
                        <div className="grid gap-3 text-sm font-semibold text-[#414296]">
                          <span>Anexos do edital em PDF</span>
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[#D8D8E8] bg-[#F8F8FB] px-5 py-8 text-center transition hover:border-[#EF1B2D]">
                            <FileText className="h-6 w-6 text-[#EF1B2D]" />
                            <span className="text-xs uppercase tracking-[0.18em] text-[#414296]">
                              Selecionar PDFs
                            </span>
                            <input
                              type="file"
                              accept="application/pdf"
                              multiple
                              onChange={(event) =>
                                handleOpportunityDocumentsChange(event.target.files)
                              }
                              className="sr-only"
                            />
                          </label>
                          {opportunityDocuments.length > 0 && (
                            <div className="grid gap-2 border-2 border-[#E2E2EA] p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00A859]">
                                Novos anexos selecionados
                              </p>
                              {opportunityDocuments.map((documentFile) => (
                                <p
                                  key={`${documentFile.name}-${documentFile.size}`}
                                  className="text-xs font-normal text-[#5F5D70]"
                                >
                                  {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              ))}
                            </div>
                          )}
                          {opportunityForm.documents.length > 0 && (
                            <div className="grid gap-3 border-2 border-[#E2E2EA] p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#414296]">
                                Anexos atuais
                              </p>
                              {opportunityForm.documents.map((documentItem) => (
                                <div
                                  key={documentItem.url}
                                  className="flex flex-wrap items-center justify-between gap-3 border border-[#E2E2EA] p-3"
                                >
                                  <a
                                    href={documentItem.url}
                                    className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#414296] underline"
                                  >
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{documentItem.name}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpportunityForm((current) => ({
                                        ...current,
                                        documents: current.documents.filter(
                                          (item) => item.url !== documentItem.url,
                                        ),
                                      }))
                                    }
                                    className="inline-flex items-center gap-2 border-2 border-[#EF1B2D] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remover
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {panel === "edicts" && (
                        <div className="grid gap-5">
                          <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                            Link externo para inscricoes
                            <input
                              value={opportunityForm.registrationUrl}
                              onChange={(event) =>
                                setOpportunityForm((current) => ({
                                  ...current,
                                  registrationUrl: event.target.value,
                                }))
                              }
                              className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                              placeholder="Opcional. Deixe vazio para usar o formulario interno."
                            />
                          </label>

                          <div className="grid gap-3 text-sm font-semibold text-[#414296]">
                            <span>Campos do formulario deste edital</span>
                            <div className="grid gap-3 md:grid-cols-2">
                              {registrationFieldOptions.map((field) => {
                                const selected = opportunityForm.fields.some(
                                  (item) => item.key === field.key,
                                );
                                const currentField = opportunityForm.fields.find(
                                  (item) => item.key === field.key,
                                );

                                return (
                                  <div key={field.key} className="border-2 border-[#E2E2EA] p-3">
                                    <label className="flex items-center gap-3 text-sm text-[#24223A]">
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleOpportunityField(field.key)}
                                        className="h-4 w-4"
                                      />
                                      {field.label}
                                    </label>
                                    {selected && (
                                      <label className="mt-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5F5D70]">
                                        <input
                                          type="checkbox"
                                          checked={currentField?.required !== false}
                                          onChange={() => toggleOpportunityFieldRequired(field.key)}
                                          className="h-4 w-4"
                                        />
                                        Obrigatorio
                                      </label>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 text-sm font-semibold text-[#414296]">
                        <span>Banner da oficina, curso ou evento</span>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[#D8D8E8] bg-[#F8F8FB] px-5 py-8 text-center transition hover:border-[#EF1B2D]">
                          <Upload className="h-6 w-6 text-[#EF1B2D]" />
                          <span className="text-xs uppercase tracking-[0.18em] text-[#414296]">
                            Selecionar imagem
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleOpportunityBannerChange(event.target.files?.[0] ?? null)
                            }
                            className="sr-only"
                          />
                        </label>
                        {opportunityBanner && (
                          <p className="text-xs font-normal text-[#5F5D70]">
                            Selecionado: {opportunityBanner.name} (
                            {(opportunityBanner.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                        {!opportunityBanner && opportunityForm.bannerUrl && (
                          <div className="grid gap-3 border-2 border-[#E2E2EA] p-3">
                            <img
                              src={opportunityForm.bannerUrl}
                              alt="Banner atual da atividade"
                              className="h-40 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setOpportunityForm((current) => ({
                                  ...current,
                                  bannerPath: "",
                                  bannerUrl: "",
                                }))
                              }
                              className="inline-flex w-fit items-center gap-2 border-2 border-[#EF1B2D] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover banner
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-5 md:grid-cols-3">
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Inicio das inscricoes
                          <input
                            type="date"
                            value={opportunityForm.startDate}
                            onChange={(event) =>
                              setOpportunityForm((current) => ({
                                ...current,
                                startDate: event.target.value,
                              }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-[#414296]">
                          Encerramento
                          <input
                            type="date"
                            value={opportunityForm.endDate}
                            onChange={(event) =>
                              setOpportunityForm((current) => ({
                                ...current,
                                endDate: event.target.value,
                              }))
                            }
                            className="border-2 border-[#E2E2EA] px-4 py-3 text-[#24223A] outline-none focus:border-[#0B86D8]"
                          />
                        </label>
                        <label className="flex items-center gap-3 self-end border-2 border-[#E2E2EA] px-4 py-3 text-sm font-semibold text-[#414296]">
                          <input
                            type="checkbox"
                            checked={opportunityForm.active}
                            onChange={(event) =>
                              setOpportunityForm((current) => ({
                                ...current,
                                active: event.target.checked,
                              }))
                            }
                            className="h-4 w-4"
                          />
                          Inscricoes abertas
                        </label>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 bg-[#EF1B2D] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#414296] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {editingOpportunityId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {saving
                            ? "Salvando..."
                            : editingOpportunityId
                              ? "Salvar atividade"
                              : "Cadastrar atividade"}
                        </button>
                        {editingOpportunityId && (
                          <button
                            type="button"
                            onClick={handleCancelOpportunityEdit}
                            className="inline-flex items-center justify-center gap-2 border-2 border-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </button>
                        )}
                        <a
                          href="/inscricoes"
                          className="inline-flex items-center justify-center gap-2 border-2 border-[#00A859] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#00A859] transition hover:bg-[#00A859] hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver pagina publica
                        </a>
                      </div>
                    </form>
                  </section>

                  <section className="grid gap-8">
                    <div className="border-2 border-[#E2E2EA] bg-white p-6">
                      <h3 className="font-sans text-2xl font-black text-[#414296]">
                        {panel === "edicts" ? "Editais cadastrados" : "Atividades com inscricao"}
                      </h3>
                      <div className="mt-5 grid gap-4">
                        {(panel === "edicts" ? edicts : courseOpportunities).length === 0 && (
                          <p className="text-sm text-[#5F5D70]">
                            {panel === "edicts"
                              ? "Nenhum edital cadastrado ainda."
                              : "Nenhuma atividade cadastrada ainda."}
                          </p>
                        )}
                        {(panel === "edicts" ? edicts : courseOpportunities).map((opportunity) => {
                          const sharePath = getRegistrationSharePath(opportunity.id);
                          const shareUrl = `${publicOrigin}${sharePath}`;

                          return (
                            <article key={opportunity.id} className="border-2 border-[#E2E2EA] p-4">
                              {opportunity.bannerUrl && (
                                <img
                                  src={opportunity.bannerUrl}
                                  alt={`Banner de ${opportunity.title}`}
                                  className="mb-4 h-36 w-full object-cover"
                                />
                              )}
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1B2D]">
                                    {formatOpportunityType(opportunity.type)} -{" "}
                                    {opportunity.active === false ? "Fechada" : "Aberta"}
                                  </p>
                                  <h4 className="mt-2 font-sans text-xl font-black text-[#24223A]">
                                    {opportunity.title}
                                  </h4>
                                  {opportunity.description && (
                                    <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">
                                      {opportunity.description}
                                    </p>
                                  )}
                                  {getOpportunityDocuments(opportunity).length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-3">
                                      {getOpportunityDocuments(opportunity).map((documentItem, index) => (
                                        <a
                                          key={documentItem.url}
                                          href={documentItem.url}
                                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#EF1B2D] underline"
                                        >
                                          <FileText className="h-4 w-4" />
                                          {documentItem.name || `Anexo ${index + 1}`}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <a
                                    href={sharePath}
                                    className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-semibold text-[#414296] underline"
                                  >
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{shareUrl}</span>
                                  </a>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditOpportunity(opportunity)}
                                    className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#414296] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                                    aria-label="Editar atividade"
                                    title="Editar atividade"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOpportunity(opportunity.id)}
                                    className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#EF1B2D] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                                    aria-label="Remover atividade"
                                    title="Remover atividade"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </section>
              )}

              {panel === "submissions" && (
                <section className="grid gap-8">
                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <Download className="h-6 w-6 text-[#00A859]" />
                      <h2 className="font-sans text-3xl font-black text-[#414296]">
                        Inscricoes recebidas
                      </h2>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5F5D70]">
                      Selecione um curso, evento ou edital para consultar as inscricoes e exportar a
                      lista em PDF, Word ou Excel.
                    </p>
                  </section>

                  <section className="grid gap-8 lg:grid-cols-[22rem_1fr]">
                    <div className="border-2 border-[#E2E2EA] bg-white p-5">
                      <h3 className="font-sans text-2xl font-black text-[#414296]">Atividades</h3>
                      <div className="mt-5 grid gap-3">
                        {opportunities.length === 0 && (
                          <p className="text-sm text-[#5F5D70]">Nenhum cadastro encontrado.</p>
                        )}
                        {opportunities.map((opportunity) => {
                          const total = registrationEntries.filter(
                            (entry) => entry.opportunityId === opportunity.id,
                          ).length;
                          const active =
                            selectedSubmissionOpportunity?.id === opportunity.id ||
                            (!selectedSubmissionOpportunityId &&
                              opportunities[0]?.id === opportunity.id);

                          return (
                            <button
                              key={opportunity.id}
                              type="button"
                              onClick={() => setSelectedSubmissionOpportunityId(opportunity.id)}
                              className={`border-2 p-4 text-left transition hover:border-[#414296] ${
                                active ? "border-[#414296] bg-[#F8F8FB]" : "border-[#E2E2EA]"
                              }`}
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1B2D]">
                                {formatOpportunityType(opportunity.type)}
                              </p>
                              <h4 className="mt-2 font-sans text-xl font-black text-[#24223A]">
                                {opportunity.title}
                              </h4>
                              <p className="mt-2 text-sm text-[#5F5D70]">
                                {total} inscricao{total === 1 ? "" : "es"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-2 border-[#E2E2EA] bg-white p-5">
                      {selectedSubmissionOpportunity ? (
                        <>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00A859]">
                                {formatOpportunityType(selectedSubmissionOpportunity.type)}
                              </p>
                              <h3 className="mt-2 font-sans text-3xl font-black text-[#414296]">
                                {selectedSubmissionOpportunity.title}
                              </h3>
                              <p className="mt-2 text-sm text-[#5F5D70]">
                                {selectedSubmissionEntries.length} inscricao
                                {selectedSubmissionEntries.length === 1 ? "" : "es"} encontrada
                                {selectedSubmissionEntries.length === 1 ? "" : "s"}.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => exportSelectedSubmissions("pdf")}
                                className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => exportSelectedSubmissions("doc")}
                                className="inline-flex items-center gap-2 border-2 border-[#0B86D8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B86D8] transition hover:bg-[#0B86D8] hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                                Word
                              </button>
                              <button
                                type="button"
                                onClick={() => exportSelectedSubmissions("csv")}
                                className="inline-flex items-center gap-2 border-2 border-[#00A859] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859] transition hover:bg-[#00A859] hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                                Excel
                              </button>
                            </div>
                          </div>

                          <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                              <thead>
                                <tr className="bg-[#F8F8FB] text-xs uppercase tracking-[0.14em] text-[#414296]">
                                  <th className="border-2 border-[#E2E2EA] p-3">Comprovante</th>
                                  {getSubmissionFields(selectedSubmissionOpportunity).map((field) => (
                                    <th key={field.key} className="border-2 border-[#E2E2EA] p-3">
                                      {field.label}
                                    </th>
                                  ))}
                                  <th className="border-2 border-[#E2E2EA] p-3">Acoes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedSubmissionEntries.length === 0 && (
                                  <tr>
                                    <td
                                      colSpan={getSubmissionFields(selectedSubmissionOpportunity).length + 2}
                                      className="border-2 border-[#E2E2EA] p-4 text-[#5F5D70]"
                                    >
                                      Nenhuma inscricao para este cadastro.
                                    </td>
                                  </tr>
                                )}
                                {selectedSubmissionEntries.map((entry) => (
                                  <tr key={entry.id}>
                                    <td className="border-2 border-[#E2E2EA] p-3 font-semibold text-[#414296]">
                                      {entry.id}
                                    </td>
                                    {getSubmissionFields(selectedSubmissionOpportunity).map((field) => (
                                      <td key={field.key} className="border-2 border-[#E2E2EA] p-3">
                                        {getEntryValue(entry, field.key) || "-"}
                                      </td>
                                    ))}
                                    <td className="border-2 border-[#E2E2EA] p-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRegistration(entry.id)}
                                        className="inline-flex h-9 w-9 items-center justify-center border-2 border-[#EF1B2D] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                                        aria-label="Remover inscricao"
                                        title="Remover inscricao"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-[#5F5D70]">Selecione uma atividade.</p>
                      )}
                    </div>
                  </section>
                </section>
              )}

              {panel === "visitRequests" && (
                <section className="grid gap-8">
                  <section className="border-2 border-[#E2E2EA] bg-white p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-6 w-6 text-[#EF1B2D]" />
                      <h2 className="font-sans text-3xl font-black text-[#414296]">
                        Solicitações de visita
                      </h2>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5F5D70]">
                      Acompanhe escolas, grupos e visitantes que preencheram o formulário público
                      para planejar uma visita ao Museu Histórico Municipal.
                    </p>
                  </section>

                  <section className="grid gap-4">
                    {visitRequests.length === 0 && (
                      <div className="border-2 border-[#E2E2EA] bg-white p-6 text-sm text-[#5F5D70]">
                        Nenhuma solicitação de visita recebida até o momento.
                      </div>
                    )}

                    {visitRequests.map((request) => (
                      <article key={request.id} className="border-2 border-[#E2E2EA] bg-white p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1B2D]">
                              {formatVisitRequestDate(request.date)} às {request.time || "--:--"}
                            </p>
                            <h3 className="mt-2 font-sans text-2xl font-black text-[#414296]">
                              {request.groupName}
                            </h3>
                            <p className="mt-2 text-sm text-[#5F5D70]">
                              Recebida em {formatVisitRequestCreatedAt(request.createdAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteVisitRequest(request.id)}
                            className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#EF1B2D] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                            aria-label="Remover solicitação de visita"
                            title="Remover solicitação de visita"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          <VisitRequestField label="Responsável" value={request.responsibleName} />
                          <VisitRequestField label="Telefone" value={request.phone} />
                          <VisitRequestField label="E-mail" value={request.email || "-"} />
                          <VisitRequestField
                            label="Visitantes"
                            value={request.visitorsCount}
                          />
                          <VisitRequestField label="Faixa etária/série" value={request.ageGroup} />
                          <VisitRequestField label="Status" value={request.status ?? "novo"} />
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <div className="border-2 border-[#F0F0F6] bg-[#F8F8FB] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">
                              Objetivo da visita
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-[#5F5D70]">
                              {request.objective || "-"}
                            </p>
                          </div>
                          <div className="border-2 border-[#F0F0F6] bg-[#F8F8FB] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">
                              Observações
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-[#5F5D70]">
                              {request.notes || "-"}
                            </p>
                          </div>
                        </div>

                        {request.requestText && (
                          <details className="mt-6 border-2 border-[#E2E2EA] p-4">
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">
                              Ver mensagem completa
                            </summary>
                            <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#5F5D70]">
                              {request.requestText}
                            </pre>
                          </details>
                        )}
                      </article>
                    ))}
                  </section>
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
                    Ative ou desative os itens que aparecem nos menus publicos do site. A pagina
                    continua existindo pelo link direto, mas some da navegacao.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {publicPages.map((page) => (
                      <article key={page.path} className="border-2 border-[#E2E2EA] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B86D8]">
                              {page.area}
                            </p>
                            <h3 className="mt-2 font-sans text-2xl font-black text-[#24223A]">
                              {page.title}
                            </h3>
                          </div>
                          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#414296]">
                            <input
                              type="checkbox"
                              checked={menuVisibility[page.path] !== false}
                              disabled={savingMenu}
                              onChange={() => handleToggleMenuItem(page.path)}
                              className="h-4 w-4"
                            />
                            {menuVisibility[page.path] !== false ? "Ativo" : "Inativo"}
                          </label>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <a
                            href={page.path}
                            className="inline-flex items-center gap-2 border-2 border-[#414296] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver
                          </a>
                          <span className="inline-flex items-center border-2 border-[#E2E2EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5F5D70]">
                            {menuVisibility[page.path] !== false ? "No menu" : "Fora do menu"}
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

function RichTextEditor({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!editorRef.current || focused) return;
    const nextValue = value ? sanitizeRichText(value) : "";

    if (editorRef.current.innerHTML !== nextValue) {
      editorRef.current.innerHTML = nextValue;
    }
  }, [focused, value]);

  function handleInput() {
    onChange(sanitizeRichText(editorRef.current?.innerHTML ?? ""));
  }

  function applyCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    handleInput();
  }

  function applyLink() {
    const url = window.prompt("Informe o link completo");
    if (!url) return;
    applyCommand("createLink", url);
  }

  const toolbarButtonClass =
    "inline-flex h-10 w-10 items-center justify-center border-2 border-[#D8D8E8] text-[#414296] transition hover:border-[#414296] hover:bg-[#414296] hover:text-white";

  return (
    <div className="grid gap-2 text-sm font-semibold text-[#414296]">
      <span>{label}</span>
      <div className="overflow-hidden border-2 border-[#E2E2EA] bg-white focus-within:border-[#0B86D8]">
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#E2E2EA] bg-[#F8F8FB] p-3">
          <select
            aria-label="Formato do texto"
            onChange={(event) => {
              applyCommand("formatBlock", event.target.value);
              event.target.value = "p";
            }}
            className="h-10 border-2 border-[#D8D8E8] bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#414296] outline-none"
            defaultValue="p"
          >
            <option value="p">Texto</option>
            <option value="h2">Titulo</option>
            <option value="h3">Subtitulo</option>
          </select>
          <button
            type="button"
            onClick={() => applyCommand("bold")}
            className={toolbarButtonClass}
            aria-label="Negrito"
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyCommand("italic")}
            className={toolbarButtonClass}
            aria-label="Italico"
            title="Italico"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyCommand("underline")}
            className={toolbarButtonClass}
            aria-label="Sublinhado"
            title="Sublinhado"
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyCommand("insertUnorderedList")}
            className={toolbarButtonClass}
            aria-label="Lista"
            title="Lista"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyCommand("insertOrderedList")}
            className={toolbarButtonClass}
            aria-label="Lista numerada"
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyCommand("formatBlock", "blockquote")}
            className={toolbarButtonClass}
            aria-label="Citacao"
            title="Citacao"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={applyLink}
            className={toolbarButtonClass}
            aria-label="Adicionar link"
            title="Adicionar link"
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={() => {
            setFocused(false);
            handleInput();
          }}
          onFocus={() => setFocused(true)}
          onInput={handleInput}
          className="min-h-40 px-4 py-3 font-normal leading-7 text-[#24223A] outline-none [&_a]:font-semibold [&_a]:text-[#414296] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#F7A600] [&_blockquote]:pl-4 [&_h2]:font-sans [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-[#414296] [&_h3]:font-sans [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-[#24223A] [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
        />
      </div>
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

function VisitRequestField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#F0F0F6] bg-[#F8F8FB] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">{label}</p>
      <p className="mt-2 break-words text-sm text-[#24223A]">{value || "-"}</p>
    </div>
  );
}

function formatVisitRequestDate(date: string) {
  if (!date) return "Data não informada";

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatVisitRequestCreatedAt(createdAt: unknown) {
  if (createdAt && typeof createdAt === "object" && "toDate" in createdAt) {
    const maybeTimestamp = createdAt as { toDate?: () => Date };

    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toLocaleString("pt-BR");
    }
  }

  return "data não informada";
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

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addCalendarDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
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
            <h2 className="font-sans text-3xl font-black text-[#414296]">Calendário</h2>
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
        <div className="w-full overflow-hidden">
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] border-l-2 border-t-2 border-[#E2E2EA]">
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
                      "min-h-32 min-w-0 border-b-2 border-r-2 border-[#E2E2EA] p-2 transition sm:p-3",
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

                    <div className="grid min-w-0 gap-1.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.occurrenceId ?? event.id}
                          className="min-w-0 overflow-hidden border-l-4 border-[#00A859] bg-[#F8FBFF] px-2 py-1.5"
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
                        <p className="truncate text-[0.68rem] font-semibold text-[#414296]">
                          +{dayEvents.length - 3} evento{dayEvents.length - 3 === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {events
            .filter((event) => event.date?.startsWith(monthKey))
            .slice(0, 6)
            .map((event) => (
              <article key={event.occurrenceId ?? event.id} className="border-2 border-[#E2E2EA] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B86D8]">
                  {event.date}
                </p>
                <h3 className="mt-2 font-semibold text-[#24223A]">{event.name}</h3>
                <p className="mt-1 text-sm text-[#5F5D70]">
                  {formatEventSchedule(event)} - {formatEventVenue(event)} - {event.secretary}
                </p>
                {formatEventRecurrence(event) && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859]">
                    {formatEventRecurrence(event)}
                  </p>
                )}
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
  onEdit,
}: {
  events: CulturalEvent[];
  onDelete: (eventId: string) => void;
  onEdit: (event: CulturalEvent) => void;
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
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    aria-label={`Editar evento ${event.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#414296] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(event.id)}
                    aria-label={`Remover evento ${event.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center border-2 border-[#EF1B2D] text-[#EF1B2D] transition hover:bg-[#EF1B2D] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-[#5F5D70]">
                {formatEventSchedule(event)} - {formatEventVenue(event)} - {event.secretary}
              </p>
              {formatEventRecurrence(event) && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859]">
                  {formatEventRecurrence(event)}
                </p>
              )}
              {event.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5F5D70]">
                  {richTextToPlainText(event.description)}
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
