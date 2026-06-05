export type UserRole = 'ORGANIZER' | 'PLATFORM_ADMIN';

export type OrganizerStatus = 'ACTIVE' | 'INACTIVE';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: OrganizerStatus;
};

export type LoginResponse = {
  accessToken: string;
  organizer: AuthUser;
};
