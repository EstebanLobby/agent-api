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
      roles: ['admin'],
      new: { path: '/dashboard/customers/new', roles: ['admin'] },
      details: (id: string) => `/dashboard/customers/${id}`,
      edit: (id: string) => `/dashboard/customers/${id}/edit`,
    },
    users: {
      path: '/dashboard/users',
      roles: ['owner'],
    },
    documentacion: { path: '/dashboard/documentacion', roles: ['admin', 'owner'] },
    integrations: { path: '/dashboard/integrations', roles: ['admin', 'member', 'owner'] },
    settings: { path: '/dashboard/settings', roles: ['admin'] },
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
