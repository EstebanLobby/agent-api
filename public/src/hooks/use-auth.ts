import { useAppDispatch, useAppSelector } from '../store';
import { signIn, signUp, signOut, resetPassword } from '../store/slices/auth/auth-thunks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    // Estado
    isAuthenticated: auth.isAuthenticated,
    isInitialized: auth.isInitialized,
    user: auth.user,
    loading: auth.loading,
    error: auth.error,

    // Acciones
    signIn: (email: string, password: string) => dispatch(signIn({ email, password })),

    signUp: (email: string, name: string, password: string) =>
      dispatch(signUp({ email, name, password })),

    signOut: () => dispatch(signOut()),

    resetPassword: (email: string) => dispatch(resetPassword({ email })),
  };
};
