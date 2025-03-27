// Hook para obtener el usuario autenticado

import { useUser } from '@/hooks/use-user';

  export function  usePermissions = () => {
    const { userData } = useUser(); // Asume que tienes un hook useAuth para acceder al contexto
  
    const hasPermission = (permission: string) => {
      return userData?.permissions?.includes(permission);
    };
  
    return { hasPermission };
  };