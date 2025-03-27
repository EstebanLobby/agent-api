export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;

  photo?: string;
  profile_image?: string;
  isActive: boolean;
  integrations: {
    whatsapp: boolean;
    facebook: boolean;
    instagram: boolean;
    telegram: boolean;
  };
  permissions?: string[];
  created_at: string;
  updatedAt: string;
  __v: number;

  [key: string]: unknown;
}