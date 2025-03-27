import React from 'react';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';

export default function Page(): React.JSX.Element {
  return <SwaggerUI url="http://localhost:5000/api-docs.json" />;
}
