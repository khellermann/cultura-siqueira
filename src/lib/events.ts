const fallbackAdminEmail = "khellermann@gmail.com";

export const adminEmails = (import.meta.env.VITE_FIREBASE_ADMIN_EMAILS ?? fallbackAdminEmail)
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export const primaryAdminEmail = adminEmails[0] ?? fallbackAdminEmail;

export const adminUsersCollection = "admin_users";
export const eventsCollection = "events";

export const equipmentOptions = [
  "Som",
  "Microfone",
  "Datashow",
  "Notebook",
  "Iluminacao",
  "Mesas",
  "Cadeiras",
  "Palco",
] as const;

export const secretaryOptions = [
  "Secretaria Municipal de Cultura",
  "Secretaria Municipal de Educacao",
  "Secretaria Municipal de Esportes",
  "Secretaria Municipal de Assistencia Social",
  "Secretaria Municipal de Saude",
  "Secretaria Municipal de Administracao",
] as const;

export type EventPeriodUnit = "horas" | "dias";
export type EventRecurrence = "none" | "weekly";
export type EventVenueType = "casa-da-cultura" | "outro";

export const casaDaCulturaVenue = "Casa da Cultura";

export const weekdayOptions = [
  { label: "Domingo", shortLabel: "Domingo", value: 0 },
  { label: "Segunda", shortLabel: "Segunda-Feira", value: 1 },
  { label: "Terca", shortLabel: "Terça-Feira", value: 2 },
  { label: "Quarta", shortLabel: "Quarta-Feira", value: 3 },
  { label: "Quinta", shortLabel: "Quinta-Feira", value: 4 },
  { label: "Sexta", shortLabel: "Sexta-Feira", value: 5 },
  { label: "Sabado", shortLabel: "Sábado", value: 6 },
] as const;

export type CulturalEvent = {
  id: string;
  allDay?: boolean;
  createdAt?: unknown;
  createdBy?: string;
  date: string;
  description?: string;
  endTime?: string;
  equipment: string[];
  flyerPath?: string;
  flyerUrl?: string;
  name: string;
  occurrenceId?: string;
  periodAmount: number;
  periodUnit: EventPeriodUnit;
  recurrence?: EventRecurrence;
  recurrenceEndDate?: string;
  recurrenceWeekdays?: number[];
  registrationEnabled?: boolean;
  registrationUrl?: string;
  secretary: string;
  startTime?: string;
  venue?: string;
  venueType?: EventVenueType;
};

export function formatEventSchedule(event: CulturalEvent) {
  if (event.allDay) return "Dia todo";
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  if (event.startTime) return `Inicio: ${event.startTime}`;
  return `Periodo: ${event.periodAmount} ${event.periodUnit}`;
}

export function formatEventVenue(event: Pick<CulturalEvent, "venue" | "venueType">) {
  if (event.venueType === "outro") return event.venue?.trim() || "Local a definir";
  return event.venue?.trim() || casaDaCulturaVenue;
}

export function formatEventRecurrence(
  event: Pick<CulturalEvent, "recurrence" | "recurrenceEndDate" | "recurrenceWeekdays">,
) {
  if ((event.recurrence ?? "none") !== "weekly") return "";

  const weekdays = new Set(event.recurrenceWeekdays ?? []);
  const selectedDays = weekdayOptions
    .filter((weekday) => weekdays.has(weekday.value))
    .map((weekday) => weekday.shortLabel)
    .join(", ");

  return selectedDays
    ? `Toda semana: ${selectedDays}${event.recurrenceEndDate ? `` : ""}`
    : "";
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
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

export function expandEventOccurrences(
  events: CulturalEvent[],
  startDateKey: string,
  endDateKey: string,
) {
  const rangeStart = parseDateKey(startDateKey);
  const rangeEnd = parseDateKey(endDateKey);

  return events.flatMap((event) => {
    if (!event.date) return [event];

    const recurrence = event.recurrence ?? "none";
    if (recurrence !== "weekly") {
      return event.date >= startDateKey && event.date <= endDateKey
        ? [{ ...event, occurrenceId: `${event.id}-${event.date}` }]
        : [];
    }

    const weekdays = new Set(event.recurrenceWeekdays ?? []);
    if (weekdays.size === 0) return [];

    const eventStart = parseDateKey(event.date);
    const eventEnd = parseDateKey(event.recurrenceEndDate || endDateKey);
    const cursorStart = eventStart > rangeStart ? eventStart : rangeStart;
    const cursorEnd = eventEnd < rangeEnd ? eventEnd : rangeEnd;
    const occurrences: CulturalEvent[] = [];

    for (let cursor = cursorStart; cursor <= cursorEnd; cursor = addCalendarDays(cursor, 1)) {
      if (!weekdays.has(cursor.getDay())) continue;
      const date = formatDateKey(cursor);
      occurrences.push({
        ...event,
        date,
        occurrenceId: `${event.id}-${date}`,
      });
    }

    return occurrences;
  });
}

export type AdminUser = {
  id: string;
  createdAt?: unknown;
  createdBy?: string;
  email: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isPrimaryAdmin(email?: string | null) {
  return adminEmails.includes(normalizeEmail(email ?? ""));
}
