import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false, // Esto desactiva el renderizado en servidor
  loading: () => <p>Cargando documentación API...</p>,
});

export default function Page() {
  // Determinar la URL basada en el entorno
  const apiDocsUrl =
    process.env.NEXT_PUBLIC_ENV === 'testing'
      ? `${process.env.NEXT_TESTING_API_URL}/api-docs.json`
      : 'https://checkia.lobby-digital.com/api-docs.json';

  return (
    <div className="p-4">
      <SwaggerUI url={apiDocsUrl} docExpansion="list" />
    </div>
  );
}
