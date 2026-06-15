export const visitRequestsCollection = "visitRequests";

export type VisitRequest = {
  id: string;
  ageGroup: string;
  createdAt?: unknown;
  date: string;
  email: string;
  groupName: string;
  notes: string;
  objective: string;
  phone: string;
  requestText: string;
  responsibleName: string;
  status?: "novo" | "contatado" | "arquivado";
  time: string;
  visitorsCount: string;
};

export type VisitRequestInput = Omit<VisitRequest, "id" | "createdAt" | "status">;
