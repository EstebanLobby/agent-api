import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false, // Esto desactiva el renderizado en servidor
  loading: () => <p>Cargando documentación API...</p>,
});

export default function Page() {
  return (
    <div className="p-4">
      <SwaggerUI url="https://checkia.lobby-digital.com/apiapi-docs.json" docExpansion="list" />
    </div>
  );
}
