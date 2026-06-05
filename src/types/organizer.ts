import type { OrganizerStatus } from './auth';

export type Organizer = {
  id: string;
  name: string;
  email: string;
  status: OrganizerStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
  totalTournaments: number;
  activeTournaments: number;
  finishedTournaments: number;
  cancelledTournaments: number;
};

export type CreateOrganizerResponse = {
  organizer: Organizer;
  temporaryPassword?: string;
};

export type ResetPasswordResponse = {
  organizer: Organizer;
  temporaryPassword: string;
};
