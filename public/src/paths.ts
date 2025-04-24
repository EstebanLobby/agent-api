export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    overview: { path: '/dashboard', roles: ['admin', 'member'] },
    account: { path: '/dashboard/account', roles: ['admin', 'member'] },
    customers: {
      path: '/dashboard/customers',
      roles: ['admin'],
      new: { path: '/dashboard/customers/new', roles: ['admin'] },
      details: (id: string) => `/dashboard/customers/${id}`,
      edit: (id: string) => `/dashboard/customers/${id}/edit`,
    },
    documentacion: { path: '/dashboard/documentacion', roles: [''] },
    integrations: { path: '/dashboard/integrations', roles: ['admin', 'member'] },
    settings: { path: '/dashboard/settings', roles: ['admin'] },
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
