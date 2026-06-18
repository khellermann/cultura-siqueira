export const contributionRequestsCollection = "contributionRequests";

export type ContributionRequest = {
  id: string;
  address: string;
  contactPreference: string;
  contributionType: string;
  createdAt?: unknown;
  description: string;
  email: string;
  messageText: string;
  name: string;
  phone: string;
  status?: "novo" | "contatado" | "arquivado";
  story: string;
  title: string;
};

export type ContributionRequestInput = Omit<ContributionRequest, "id" | "createdAt" | "status">;
