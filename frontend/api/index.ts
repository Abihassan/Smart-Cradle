import { apiClient } from "./client";

// ---------- Types ----------

export interface Baby {
  id: string;
  name: string;
  birth_date: string;
  created_at: string;
}

export interface BabyStatus {
  baby: Baby;
  latest_temperature: number | null;
  latest_humidity: number | null;
  latest_moisture: number | null;
  is_crying: boolean;
  cry_reason: string | null;
  cry_confidence: number | null;
  swing_on: boolean;
  music_on: boolean;
  feeding_active: boolean;
  unread_alerts: number;
}

export type SensorType = "temperature" | "humidity" | "moisture";

export interface SensorReading {
  id: string;
  type: SensorType;
  value: number;
  timestamp: string;
}

export type AlertType = "cry" | "urination" | "feeding" | "emergency";

export interface Alert {
  id: string;
  type: AlertType;
  reason: string | null;
  confidence: number | null;
  read: boolean;
  timestamp: string;
}

export interface DeviceStateResponse {
  id: string;
  baby_id: string;
  swing_on: boolean;
  swing_intensity: number;
  music_on: boolean;
  music_track: string | null;
  feeding_active: boolean;
  auto_mode: boolean;
  updated_at: string;
}

export interface ReportSummary {
  temperature_series: SensorReading[];
  humidity_series: SensorReading[];
  moisture_series: SensorReading[];
  cry_events: Alert[];
  sleep_minutes_today: number;
}

// ---------- Baby ----------

export const BabyApi = {
  list: () => apiClient.get<Baby[]>("/api/baby").then((r) => r.data),

  create: (name: string, birthDate: string) =>
    apiClient.post<Baby>("/api/baby", { name, birth_date: birthDate }).then((r) => r.data),

  status: (babyId: string) =>
    apiClient.get<BabyStatus>(`/api/baby/${babyId}/status`).then((r) => r.data),

  reports: (babyId: string) =>
    apiClient.get<ReportSummary>(`/api/baby/${babyId}/reports`).then((r) => r.data),
};

// ---------- Sensors ----------

export const SensorApi = {
  list: (babyId: string, type?: SensorType, limit = 100) =>
    apiClient
      .get<SensorReading[]>(`/api/baby/${babyId}/sensors`, { params: { type, limit } })
      .then((r) => r.data),
};

// ---------- Alerts ----------

export const AlertApi = {
  list: (babyId: string, opts?: { type?: AlertType; unreadOnly?: boolean; limit?: number }) =>
    apiClient
      .get<Alert[]>(`/api/baby/${babyId}/alerts`, {
        params: { type: opts?.type, unread_only: opts?.unreadOnly, limit: opts?.limit },
      })
      .then((r) => r.data),

  markRead: (babyId: string, alertIds: string[]) =>
    apiClient.post(`/api/baby/${babyId}/alerts/mark-read`, { alert_ids: alertIds }),
};

// ---------- Device control ----------

export const DeviceApi = {
  getState: (babyId: string) =>
    apiClient.get<DeviceStateResponse>(`/api/baby/${babyId}/device`).then((r) => r.data),

  setSwing: (babyId: string, on: boolean, intensity?: number) =>
    apiClient
      .post<DeviceStateResponse>(`/api/baby/${babyId}/device/swing`, { on, intensity })
      .then((r) => r.data),

  setMusic: (babyId: string, on: boolean, track?: string) =>
    apiClient
      .post<DeviceStateResponse>(`/api/baby/${babyId}/device/music`, { on, track })
      .then((r) => r.data),

  triggerFeed: (babyId: string, trigger: boolean) =>
    apiClient
      .post<DeviceStateResponse>(`/api/baby/${babyId}/device/feed`, { trigger })
      .then((r) => r.data),

  setAutoMode: (babyId: string, autoMode: boolean) =>
    apiClient
      .post<DeviceStateResponse>(`/api/baby/${babyId}/device/auto-mode`, { auto_mode: autoMode })
      .then((r) => r.data),
};
