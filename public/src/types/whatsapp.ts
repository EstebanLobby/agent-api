export interface WhatsAppQRCodeResponse {
  qr: string;
}

export interface WhatsAppStatusResponse {
  status: string;
}

export interface SendMessageParams {
  numero: string;
  mensaje: string;
}

export interface WhatsAppSession {
  _id: string;
  numero: string;
  status: 'pending' | 'connected' | 'disconnected';
  createdAt: string;
  updatedAt: string;
}
