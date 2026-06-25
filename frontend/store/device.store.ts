import { create } from "zustand";

interface DeviceState {
  swingOn: boolean;
  swingIntensity: number;
  musicOn: boolean;
  musicTrack: string | null;
  feedingActive: boolean;
  autoMode: boolean;

  setState: (partial: Partial<Omit<DeviceState, "setState">>) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  swingOn: false,
  swingIntensity: 0,
  musicOn: false,
  musicTrack: null,
  feedingActive: false,
  autoMode: true,

  setState: (partial) => set(partial),
}));
