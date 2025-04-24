import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/auth-client';

// Hook para obtener el usuario autenticado
export function useFetchUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await authClient.getUser();
      return data;
    },
    // Para debug: siempre consulta
    staleTime: 0,
    gcTime: 0, // también evita que guarde el resultado por más tiempo
    retry: false,
  });
}

// Hook para iniciar sesión
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return authClient.signInWithPassword({ email, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Actualiza la caché del usuario tras login
    },
  });
}

// Hook para cerrar sesión
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return authClient.signOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Elimina el usuario de la caché tras logout
    },
  });
}

// Hook para registrarse
export function useSignUp() {
  return useMutation({
    mutationFn: async (params: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      return authClient.signUp(params);
    },
  });
}
