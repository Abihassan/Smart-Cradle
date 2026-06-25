import { create } from "zustand";

export interface SensorSnapshot {
  temperature: number | null;
  humidity: number | null;
  moisture: number | null;
  updatedAt: string | null;
}

export interface CryEvent {
  reason: string;
  confidence: number;
  timestamp: string;
}

interface BabyState {
  selectedBabyId: string | null;
  sensors: SensorSnapshot;
  isCrying: boolean;
  lastCryEvent: CryEvent | null;

  setSelectedBaby: (id: string | null) => void;
  updateSensor: (type: "temperature" | "humidity" | "moisture", value: number) => void;
  setCryEvent: (event: CryEvent) => void;
  clearCry: () => void;
}

export const useBabyStore = create<BabyState>((set) => ({
  selectedBabyId: null,
  sensors: { temperature: null, humidity: null, moisture: null, updatedAt: null },
  isCrying: false,
  lastCryEvent: null,

  setSelectedBaby: (id) => set({ selectedBabyId: id }),

  updateSensor: (type, value) =>
    set((state) => ({
      sensors: { ...state.sensors, [type]: value, updatedAt: new Date().toISOString() },
    })),

  setCryEvent: (event) => set({ isCrying: true, lastCryEvent: event }),
  clearCry: () => set({ isCrying: false }),
}));
