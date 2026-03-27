import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useThemedStyles } from '../../theme/useThemedStyles';
import { ColorTheme } from '../../theme/colors';

type MarginObject =
  | {
      left?: number;
      right?: number;
    }
  | {
      top?: number;
      bottom?: number;
    };

type DividerProps = {
  /**
   * Margin on the horizontal sides
   * Can be a number or an object specifying left and right margins separately
   */
  horizontalMargin?: number | MarginObject;

  /**
   * Margin on the vertical sides
   * Can be a number or an object specifying top and bottom margins separately
   */
  verticalMargin?: number | MarginObject;

  /**
   * Color of the divider
   * @default '#E0E0E0'
   */
  color?: string | null;

  /**
   * Thickness of the divider line
   * @default Stylesheet.hairlineWidth
   */
  thickness?: number;

  /**
   * Style override for the divider
   */
  style?: ViewStyle;
};

export function Divider({
  horizontalMargin = 0,
  verticalMargin = 0,
  color = null,
  thickness = StyleSheet.hairlineWidth,
  style,
}: DividerProps) {
  const themedStyle = useThemedStyles(createStyles);

  // Calculate horizontal margins
  const horizontalMargins = React.useMemo(() => {
    if (typeof horizontalMargin === 'number') {
      return {
        marginLeft: horizontalMargin,
        marginRight: horizontalMargin,
      };
    }
    return {
      marginLeft: 'left' in horizontalMargin ? horizontalMargin.left : 0,
      marginRight: 'right' in horizontalMargin ? horizontalMargin.right : 0,
    };
  }, [horizontalMargin]);

  // Calculate vertical margins
  const verticalMargins = React.useMemo(() => {
    if (typeof verticalMargin === 'number') {
      return {
        marginTop: verticalMargin,
        marginBottom: verticalMargin,
      };
    }
    return {
      marginTop: 'top' in verticalMargin ? verticalMargin.top : 0,
      marginBottom: 'bottom' in verticalMargin ? verticalMargin.bottom : 0,
    };
  }, [verticalMargin]);

  return (
    <View
      style={[
        {
          backgroundColor: color ?? themedStyle.divider.backgroundColor,
          height: thickness,
          ...horizontalMargins,
          ...verticalMargins,
        },
        style,
      ]}
    />
  );
}

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    divider: {
      backgroundColor: theme.borderLight,
    },
  });
