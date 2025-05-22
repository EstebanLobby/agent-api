// src/helpers/get-path.ts
export const getPath = (route: { path: string } | undefined): string => {
  if (!route) {
    throw new Error('Invalid route object');
  }
  return route.path;
};