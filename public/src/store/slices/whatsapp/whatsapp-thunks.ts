import { createAsyncThunk } from '@reduxjs/toolkit';
import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';
import { logger } from '@/lib/default-logger';

// Thunks
export const disconnectWhatsApp = createAsyncThunk(
  'whatsapp/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const response = await whatsappClient.disconnectSession();
      return response;
    } catch (error) {
      logger.error('Error disconnecting WhatsApp:', error);
      return rejectWithValue(error);
    }
  }
); 