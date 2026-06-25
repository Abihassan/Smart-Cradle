import { Pause, Play } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "../../utils/constants";
import { haptics } from "../../utils/haptics";

export const TRACKS = [
  { id: "lullaby-1", label: "Soft Lullaby" },
  { id: "white-noise", label: "White Noise" },
  { id: "ocean-waves", label: "Ocean Waves" },
  { id: "heartbeat", label: "Womb Heartbeat" },
];

interface MusicPlaylistProps {
  musicOn: boolean;
  currentTrack: string | null;
  onSelect: (trackId: string) => void;
  onToggle: () => void;
}

export function MusicPlaylist({ musicOn, currentTrack, onSelect, onToggle }: MusicPlaylistProps) {
  return (
    <View style={{ gap: SPACING.sm }}>
      {TRACKS.map((track) => {
        const isCurrent = currentTrack === track.id;
        const isPlaying = isCurrent && musicOn;

        return (
          <Pressable
            key={track.id}
            onPress={() => {
              haptics.light();
              if (isCurrent) {
                onToggle();
              } else {
                onSelect(track.id);
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: SPACING.lg,
              borderRadius: RADIUS.md,
              backgroundColor: isCurrent ? COLORS.primaryMuted : COLORS.surface,
              borderWidth: 1,
              borderColor: isCurrent ? COLORS.primary : COLORS.border,
            }}
          >
            <Text
              style={{
                color: isCurrent ? COLORS.primary : COLORS.textPrimary,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
              }}
            >
              {track.label}
            </Text>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isCurrent ? COLORS.primary : COLORS.surfaceAlt,
              }}
            >
              {isPlaying ? (
                <Pause color="#fff" size={14} />
              ) : (
                <Play color={isCurrent ? "#fff" : COLORS.textSecondary} size={14} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
