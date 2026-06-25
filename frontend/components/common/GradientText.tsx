import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Text, TextStyle } from "react-native";

import { GRADIENTS } from "../../utils/constants";

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: readonly [string, string, ...string[]];
}

export function GradientText({ children, style, colors = GRADIENTS.primary }: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: "transparent" }]}>{children}</Text>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
