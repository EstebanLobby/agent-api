'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/user/user-selectors';

export default function Page() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user) {
      switch (user.role.name) {
        case 'member':
          router.push('/dashboard/integrations');
          break;
        case 'owner':
          router.push('/dashboard/users');
          break;
        case 'admin':
          router.push('/dashboard/customers');
          break;
        default:
          // Si no tiene rol definido, redirigir a login
          router.push('/auth/login');
      }
    } else {
      // Si no hay usuario, redirigir a login
      router.push('/auth/login');
    }
  }, [user, router]);

  // Mostrar un loading mientras se verifica el rol
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
