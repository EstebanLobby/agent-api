export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  photo: string;
  phone?: string;
  address?: string;
  permissions?: string[];
  integrations: {
    whatsapp: boolean;
    facebook: boolean;
    instagram: boolean;
    telegram: boolean;
  };
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason: string | null;
  suspendedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  id: string;
}

export interface UpdateUserProfilePayload {
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo?: string;
}
