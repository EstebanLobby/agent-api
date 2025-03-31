export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  photo?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  timezone?: string;
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
  role: 'admin' | 'member';
  [key: string]: unknown;
}
