import { useUser } from '@/hooks/use-user';

interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { userData } = useUser();

  const hasPermission = (permission: string): boolean => {
    return Boolean(userData?.permissions?.includes(permission));
  };

  return { hasPermission };
}
