import { useUser } from '@/hooks/use-user';

interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useUser();

  const hasPermission = (permission: string): boolean => {
    return Boolean(user?.permissions?.includes(permission));
  };

  return { hasPermission };
}
