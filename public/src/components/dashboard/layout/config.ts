import getPath from '@/helpers/get-path';



import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';





export const navItems = [
  { key: 'overview', title: 'Overview', href: getPath(paths.dashboard.overview), icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: getPath(paths.dashboard.customers), icon: 'users' },
  {
    key: 'integrations',
    title: 'Integrations',
    href: getPath(paths.dashboard.integrations),
    icon: 'plugs-connected',
  },
  { key: 'documentacion', title: 'Documentacion', href: getPath(paths.dashboard.documentacion), icon: 'doc' },
  { key: 'settings', title: 'Settings', href: getPath(paths.dashboard.settings), icon: 'gear-six' },
  { key: 'account', title: 'Cuenta', href: getPath(paths.dashboard.account), icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];