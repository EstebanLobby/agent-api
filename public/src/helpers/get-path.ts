const getPath = (route: { path: string } | undefined): string => {
  if (!route) {
    throw new Error('Invalid route object'); // O devuelve una ruta por defecto
  }
  return route.path;
};

export default getPath;
