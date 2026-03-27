import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';

interface LoadingIndicatorProps {
  size?: number;
  color?: string;
  thickness?: number;
  duration?: number;
  arcSize?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 20,
  color = '#000',
  thickness = 2,
  duration = 700,
  arcSize = 200,
}) => {
  const normalizedArcSize = Math.min(Math.max(arcSize, 1), 360);

  const rotation = useSharedValue(0);

  // Pre-calculate static arc path (only once)
  const arcPath = React.useMemo(() => {
    const radius = (size - thickness) / 2;
    const rect = Skia.XYWHRect(
      size / 2 - radius,
      size / 2 - radius,
      radius * 2,
      radius * 2,
    );
    const p = Skia.Path.Make();
    // Start at top (-90 degrees), sweep by normalizedArcSize degrees
    p.addArc(rect, -90, normalizedArcSize);
    return p;
  }, [size, thickness, normalizedArcSize]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Canvas style={{ width: size, height: size }}>
        <Group origin={{ x: size / 2, y: size / 2 }}>
          <Path
            path={arcPath}
            color={color}
            style="stroke"
            strokeWidth={thickness}
            strokeCap="round"
          />
        </Group>
      </Canvas>
    </Animated.View>
  );
};
