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
  periodAmount: number;
  periodUnit: EventPeriodUnit;
  registrationEnabled?: boolean;
  registrationUrl?: string;
  secretary: string;
  startTime?: string;
};

export function formatEventSchedule(event: CulturalEvent) {
  if (event.allDay) return "Dia todo";
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  if (event.startTime) return `Inicio: ${event.startTime}`;
  return `Periodo: ${event.periodAmount} ${event.periodUnit}`;
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
