"use client"

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/user/user-selectors';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false, // Esto desactiva el renderizado en servidor
  loading: () => <p>Cargando documentación API...</p>,
});

export default function Page() {
  const user = useAppSelector(selectCurrentUser);
  const [apiDocsUrl, setApiDocsUrl] = useState<string>('');

  useEffect(() => {
    if (user?.role?.name) {
      // Construir la URL con el rol como query parameter
      const baseUrl = 'http://localhost:5000/api-docs/swagger.json';
      const urlWithRole = `${baseUrl}?role=${user.role.name}`;
      setApiDocsUrl(urlWithRole);
    }
  }, [user]);

  if (!user?.role?.name) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">
          Por favor, inicia sesión para ver la documentación
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {apiDocsUrl && (
        <SwaggerUI 
          url={apiDocsUrl} 
          docExpansion="list"
          defaultModelsExpandDepth={-1}
          supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
          tryItOutEnabled={true}
          requestInterceptor={(req) => {
            // Agregar el token de autenticación a todas las peticiones
            const token = localStorage.getItem('token');
            if (token) {
              req.headers.Authorization = `Bearer ${token}`;
            }
            return req;
          }}
          responseInterceptor={(res) => {
            // Manejar errores de autenticación
            if (res.status === 401) {
              console.error('Error de autenticación');
            }
            return res;
          }}
        />
      )}
    </div>
  );
}
