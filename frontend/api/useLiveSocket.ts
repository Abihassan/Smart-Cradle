import { useEffect, useRef } from "react";

import { TokenService } from "../auth/token.service";
import { useBabyStore } from "../store/baby.store";
import { useDeviceStore } from "../store/device.store";
import { WS_BASE_URL } from "../utils/constants";

/**
 * Opens a WebSocket connection to /ws/live/{babyId} and routes incoming
 * messages into the baby/device Zustand stores. Reconnects on close with
 * simple backoff. Call once near the root of the authenticated app
 * (e.g. tabs layout) — consuming screens just read from the stores.
 */
export function useLiveSocket(babyId: string | null) {
  const updateSensor = useBabyStore((s) => s.updateSensor);
  const setCryEvent = useBabyStore((s) => s.setCryEvent);
  const setDeviceState = useDeviceStore((s) => s.setState);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!babyId) return;

    let cancelled = false;

    const connect = async () => {
      const token = await TokenService.getAccessToken();
      if (!token || cancelled) return;

      const ws = new WebSocket(`${WS_BASE_URL}/ws/live/${babyId}?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    const handleMessage = (message: { type: string; data: any }) => {
      switch (message.type) {
        case "sensor_update":
          updateSensor(message.data.sensor_type, message.data.value);
          break;
        case "cry_event":
          setCryEvent({
            reason: message.data.reason,
            confidence: message.data.confidence,
            timestamp: new Date().toISOString(),
          });
          break;
        case "device_state":
          setDeviceState({
            swingOn: message.data.swing_on,
            swingIntensity: message.data.swing_intensity,
            musicOn: message.data.music_on,
            musicTrack: message.data.music_track,
            feedingActive: message.data.feeding_active,
            autoMode: message.data.auto_mode,
          });
          break;
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [babyId]);
}
