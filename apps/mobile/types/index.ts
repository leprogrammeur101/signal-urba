export type Role = 'CITIZEN' | 'ADMIN';
export type ReportStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Report {
  id: string;
  title?: string;
  description?: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: ReportStatus;
  category: Category;
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  createdAt: string;
  updatedAt: string;
}
