export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    unauthorized: '/auth/unauthorized',
  },
  dashboard: {
    overview: { path: '/dashboard', roles: ['admin', 'member', 'owner'] },
    account: { path: '/dashboard/account', roles: ['admin', 'member', 'owner'] },
    customers: {
      path: '/dashboard/customers',
      roles: ['admin', 'owner'],
      new: { path: '/dashboard/customers/new', roles: ['admin', 'owner'] },
      details: (id: string) => `/dashboard/customers/${id}`,
      edit: (id: string) => `/dashboard/customers/${id}/edit`,
    },
    users: {
      path: '/dashboard/users',
      roles: ['admin'],
    },
    owners: {
      path: '/dashboard/owners',
      roles: ['admin'],
    },
    documentacion: { path: '/dashboard/documentacion', roles: ['admin', 'member', 'owner'] },
    integrations: { path: '/dashboard/integrations', roles: ['admin', 'member', 'owner'] },
    settings: { path: '/dashboard/settings', roles: ['admin', 'owner'] },
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
