'use client';

import type {
  WhatsAppQRCodeResponse,
  WhatsAppSession,
  WhatsAppStatusResponse,
} from '@/types/whatsapp';
import { api } from '@/lib/api';

class WhatsAppClient {
  private static readonly BASE_PATH = '/whatsapp';
  private static readonly ADMIN_PATH = '/admin/whatsapp';

  /**
   * Obtiene el código QR en base64 para conectar WhatsApp.
   * (Método estático porque no depende del estado de la instancia)
   */
  static async getQRCode(): Promise<{ qr?: string; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppQRCodeResponse>(`/whatsapp/qr`);
      return { qr: data.qr };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Error obteniendo el QR',
      };
    }
  }

  /**
   * Verifica el estado de conexión de WhatsApp.
   * (Método de instancia porque podría depender del estado futuro)
   */
  static async checkStatus(numero: string): Promise<{ status?: string; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppStatusResponse>(`/whatsapp/status/${numero}`);
      return { status: data.status };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Error verificando estado',
      };
    }
  }

  /**
   * Verifica el estado de la sesión actual.
   */
  async checkCurrentSession(): Promise<{ isActive: boolean; error?: string }> {
    try {
      const { data } = await api.get<{ status: string }>(`${WhatsAppClient.BASE_PATH}/status`);
      return { isActive: data.status === 'connected' };
    } catch (error: any) {
      return {
        isActive: false,
        error: error.response?.data?.message || 'Error verificando estado de la sesión'
      };
    }
  }

  /**
   * Envía un mensaje de WhatsApp.
   */
  async sendMessage(params: {
    destino: string;
    mensaje: string;
    sessionId?: string;
  }): Promise<{ success?: boolean; error?: string }> {
    try {
      // Verificar estado de la sesión antes de enviar
      const sessionStatus = await this.checkCurrentSession();
      if (!sessionStatus.isActive) {
        return {
          error: 'No hay una sesión activa de WhatsApp. Por favor, escanea el código QR primero.'
        };
      }

      const response = await api.post<{ success: boolean }>(
        `${WhatsAppClient.BASE_PATH}/send`,
        params,
      );
      return { success: response.data.success };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Error enviando mensaje',
      };
    }
  }

  /**
   * Inicia una sesión de WhatsApp.
   */
  async startSession(numero: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await api.post(`${WhatsAppClient.BASE_PATH}/start`, { numero });
      return { success: true };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Error iniciando sesión',
      };
    }
  }

  /**
   * Obtiene todas las sesiones activas.
   */
  async getSessions(): Promise<{ sessions?: WhatsAppSession[]; error?: string }> {
    try {
      const { data } = await api.get<WhatsAppSession[]>(`${WhatsAppClient.BASE_PATH}/sesiones`);
      return { sessions: data };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Error obteniendo sesiones',
      };
    }
  }

  /**
   * Envía un mensaje de WhatsApp como otro usuario (solo para admin/owner).
   */
  async sendMessageAsUser(params: {
    userId: string;
    numero: string;
    mensaje: string;
  }): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await api.post<{ success: boolean }>(
        `${WhatsAppClient.ADMIN_PATH}/send-as-user`,
        params,
      );
      return { success: response.data.success };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Error enviando mensaje como usuario',
      };
    }
  }
}

// Exporta una instancia singleton como default
export const whatsappClient = new WhatsAppClient();

// Exporta la clase directamente para casos especiales
export { WhatsAppClient };
