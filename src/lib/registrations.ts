export const registrationOpportunitiesCollection = "registration_opportunities";
export const registrationsCollection = "registrations";

export const registrationOpportunityTypes = ["oficina", "curso", "evento"] as const;

export type RegistrationOpportunityType = (typeof registrationOpportunityTypes)[number];

export type RegistrationOpportunity = {
  active: boolean;
  bannerPath?: string;
  bannerUrl?: string;
  createdAt?: unknown;
  createdBy?: string;
  description: string;
  endDate: string;
  id: string;
  startDate: string;
  title: string;
  type: RegistrationOpportunityType;
  updatedAt?: unknown;
  updatedBy?: string;
};

export type RegistrationEntry = {
  address: string;
  birthDate: string;
  createdAt?: unknown;
  fullName: string;
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: RegistrationOpportunityType;
  phone: string;
};

export function formatOpportunityType(type: RegistrationOpportunityType) {
  const labels = {
    curso: "Curso",
    evento: "Evento",
    oficina: "Oficina",
  } satisfies Record<RegistrationOpportunityType, string>;

  return labels[type];
}

export function getRegistrationSharePath(opportunityId: string) {
  return `/inscricoes?atividade=${encodeURIComponent(opportunityId)}`;
}

export function isRegistrationOpportunityOpen(
  opportunity: RegistrationOpportunity,
  todayKey = new Date().toISOString().slice(0, 10),
) {
  if (opportunity.active === false) return false;
  if (opportunity.startDate && opportunity.startDate > todayKey) return false;
  if (opportunity.endDate && opportunity.endDate < todayKey) return false;
  return true;
}
