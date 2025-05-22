import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { disconnectWhatsApp } from './whatsapp-thunks';

export interface WhatsAppState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isConnected: boolean;
  sessions: Array<{
    _id: string;
    numero: string;
    status: 'pending' | 'connected' | 'disconnected';
    createdAt: string;
  }>;
}


const initialState: WhatsAppState = {
  status: 'idle',
  error: null,
  isConnected: false,
  sessions: [],
};

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setSessions: (state, action: PayloadAction<WhatsAppState['sessions']>) => {
      state.sessions = action.payload;
    },
    updateSessionStatus: (state, action: PayloadAction<{ id: string; status: WhatsAppState['sessions'][0]['status'] }>) => {
      const session = state.sessions.find(s => s._id === action.payload.id);
      if (session) {
        session.status = action.payload.status;
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Disconnect
      .addCase(disconnectWhatsApp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(disconnectWhatsApp.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isConnected = false;
        state.error = null;
      })
      .addCase(disconnectWhatsApp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { 
  resetStatus, 
  setSessions, 
  updateSessionStatus,
  setConnectionStatus 
} = whatsappSlice.actions;

export default whatsappSlice.reducer; 