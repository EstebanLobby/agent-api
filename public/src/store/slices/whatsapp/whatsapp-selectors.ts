import { RootState } from '@/store';

// Selectores básicos
export const selectWhatsAppState = (state: RootState) => state.whatsapp;

// Selectores derivados
export const selectWhatsAppStatus = (state: RootState) => state.whatsapp.status;
export const selectWhatsAppError = (state: RootState) => state.whatsapp.error;
export const selectIsWhatsAppConnected = (state: RootState) => state.whatsapp.isConnected;
export const selectWhatsAppSessions = (state: RootState) => state.whatsapp.sessions;

// Selectores compuestos
export const selectWhatsAppStatusInfo = (state: RootState) => ({
  status: state.whatsapp.status,
  error: state.whatsapp.error,
  isConnected: state.whatsapp.isConnected,
});

export const selectConnectedSessions = (state: RootState) => 
  state.whatsapp.sessions.filter(session => session.status === 'connected');

export const selectPendingSessions = (state: RootState) => 
  state.whatsapp.sessions.filter(session => session.status === 'pending');

export const selectDisconnectedSessions = (state: RootState) => 
  state.whatsapp.sessions.filter(session => session.status === 'disconnected');

export const selectSessionById = (state: RootState, sessionId: string) => 
  state.whatsapp.sessions.find(session => session._id === sessionId); 