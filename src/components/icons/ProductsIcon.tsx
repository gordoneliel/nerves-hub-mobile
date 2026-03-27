import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ProductsIconProps {
  size?: number;
  color?: string;
}

export function ProductsIcon({ size = 24, color = '#656D76' }: ProductsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 8L12 2L3 8V16L12 22L21 16V8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M12 22V12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M21 8L12 12L3 8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
