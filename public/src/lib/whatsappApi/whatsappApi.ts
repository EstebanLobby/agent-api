'use client';

import type { SendMessageParams, WhatsAppQRCodeResponse, WhatsAppSession, WhatsAppStatusResponse } from '@/types/whatsapp';
import { api } from '@/lib/api';





class WhatsAppClient {
  /**
   * Obtiene el código QR en base64 para conectar WhatsApp.
   */
  async getQRCode(): Promise<{ qr?: string; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppQRCodeResponse>('/whatsapp/qr');
      return { qr: data.qr };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error obteniendo el QR' };
    }
  }

  /**
   * Verifica el estado de conexión de un número de WhatsApp.
   * @param numero - Número de WhatsApp a verificar
   */
  async checkStatus(numero: string): Promise<{ status?: string; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppStatusResponse>(`/whatsapp/status/${numero}`);
      return { status: data.status };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error verificando estado' };
    }
  }

  /**
   * Envía un mensaje de WhatsApp.
   * @param params - Objeto con número, destinatario y mensaje
   */
  async sendMessage(params: { destino: string; mensaje: string }): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; error?: string }>('/whatsapp/send', params);
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error enviando mensaje' };
    }
  }

  /**
   * Inicia una sesión de WhatsApp.
   */
  async startSession(): Promise<{ success?: boolean; error?: string }> {
    try {
      await api.post('/whatsapp/start');
      return { success: true };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error iniciando sesión' };
    }
  }

  /**
   * Obtiene todas las sesiones activas de WhatsApp.
   */
  async getSessions(): Promise<{ sessions?: WhatsAppSession[]; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppSession[]>('/whatsapp/sesiones');
      return { sessions: data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error obteniendo sesiones' };
    }
  }
}

export const whatsappClient = new WhatsAppClient();