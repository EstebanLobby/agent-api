import { useUser } from '@/hooks/use-user';

const useRole = () => {
  const { user } = useUser();

  /**
   * Verifica si el usuario tiene un rol específico.
   * @param role - El nombre del rol a verificar (por ejemplo, "admin").
   * @returns `true` si el usuario tiene el rol, `false` en caso contrario.
   */
  const hasRole = (role: string) => {
    return user?.role === role;
  };

  return { hasRole };
};

export default useRole;
