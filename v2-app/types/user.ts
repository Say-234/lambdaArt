// types/user.ts
export type UserRole = 'super_admin' | 'etablissement' | 'unknown';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  nom?: string;
  etablissementId?: string | null;
  createdAt?: Date;
  permissions?: string[];
  active?: boolean;
  lastLogin?: Date;
}