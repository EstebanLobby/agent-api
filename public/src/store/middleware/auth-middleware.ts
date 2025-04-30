import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import axios from 'axios';

const createAuthMiddleware = (): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    // Primero ejecutamos la acción
    const result = next(action);

    // Obtenemos el token después de la acción
    const state = store.getState();
    const { token } = state.auth;

    // Configuramos axios con el nuevo token
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    return result;
  };
};

export default createAuthMiddleware;
