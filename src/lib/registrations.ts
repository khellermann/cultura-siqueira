export const registrationOpportunitiesCollection = "registration_opportunities";
export const registrationsCollection = "registrations";

export const registrationOpportunityTypes = ["oficina", "curso", "evento", "edital"] as const;

export const registrationFieldOptions = [
  { key: "fullName", label: "Nome/Razao social", required: true },
  { key: "document", label: "CPF/CNPJ", required: true },
  { key: "birthDate", label: "Data de nascimento", required: false },
  { key: "address", label: "Endereco", required: true },
  { key: "phone", label: "Telefone", required: true },
  { key: "email", label: "E-mail", required: false },
] as const;

export type RegistrationOpportunityType = (typeof registrationOpportunityTypes)[number];
export type RegistrationFieldKey = (typeof registrationFieldOptions)[number]["key"];

export type RegistrationFieldConfig = {
  key: RegistrationFieldKey;
  label: string;
  required: boolean;
};

export type RegistrationOpportunity = {
  active: boolean;
  bannerPath?: string;
  bannerUrl?: string;
  createdAt?: unknown;
  createdBy?: string;
  description: string;
  documentPath?: string;
  documentUrl?: string;
  endDate: string;
  fields?: RegistrationFieldConfig[];
  id: string;
  registrationUrl?: string;
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
  document?: string;
  email?: string;
  formData?: Record<string, string>;
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
    edital: "Edital",
    evento: "Evento",
    oficina: "Oficina",
  } satisfies Record<RegistrationOpportunityType, string>;

  return labels[type];
}

export function getRegistrationSharePath(opportunityId: string) {
  return `/inscricoes?atividade=${encodeURIComponent(opportunityId)}`;
}

export function getDefaultRegistrationFields(type: RegistrationOpportunityType) {
  if (type === "edital") {
    return registrationFieldOptions.map((field) => ({ ...field }));
  }

  return registrationFieldOptions
    .filter((field) => ["fullName", "birthDate", "address", "phone", "email"].includes(field.key))
    .map((field) => ({ ...field, required: field.key === "email" ? false : true }));
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
