import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DeploymentIconProps {
  size?: number;
  color?: string;
}

export function DeploymentIcon({ size = 14, color = '#656D76' }: DeploymentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 7l10 5 10-5-10-5Z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="m2 17 10 5 10-5M2 12l10 5 10-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 7l10 5 10-5-10-5-10 5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
