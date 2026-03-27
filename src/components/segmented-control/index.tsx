import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { trigger } from 'react-native-haptic-feedback';

import { Typography } from '../typography';
import useThemedStyles from '../../theme/useThemedStyles';
import { colors, ColorTheme } from '../../theme/colors';

export interface SegmentedControlSegment {
  /**
   * The label to display for this segment
   */
  label: string;
  /**
   * Optional value for this segment (defaults to label if not provided)
   */
  value?: string;
  /**
   * Whether this segment is disabled
   */
  disabled?: boolean;
  /**
   * Icon for this segment
   */
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  /**
   * Array of segments to display
   */
  segments: SegmentedControlSegment[];
  /**
   * The currently selected segment index
   */
  selectedIndex: number;
  /**
   * Callback when a segment is selected
   */
  onSelectionChange: (index: number, segment: SegmentedControlSegment) => void;
  /**
   * Whether the segments are displayed in a row or column
   */
  direction?: 'row' | 'column';
  /**
   * Background color of the control
   */
  backgroundColor?: string;
  /**
   * Background color of the selected segment
   */
  selectedBackgroundColor?: string;
  /**
   * Text color for unselected segments
   */
  textColor?: string;
  /**
   * Text color for the selected segment
   */
  selectedTextColor?: string;
  /**
   * Border color of the control
   */
  borderColor?: string;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  /**
   * Border radius of the control
   */
  borderRadius?: number;
  /**
   * Padding inside the control
   */
  padding?: number;
  /**
   * Font size for segment labels
   */
  fontSize?: number;
  /**
   * Font weight for segment labels
   */
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /**
   * Whether the control is disabled
   */
  disabled?: boolean;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelectionChange,
  selectedBackgroundColor = colors.midnight[1],
  textColor = '#64748B',
  selectedTextColor = '#FFFFFF',
  borderColor = '#E2E8F0',
  animationDuration = 200,
  borderRadius = 22,
  padding = 0,
  fontSize = 13,
  fontWeight = 500,
  disabled = false,
  direction = 'row',
}: SegmentedControlProps) {
  const themedStyles = useThemedStyles(createStyles);
  const segmentWidth = 1 / segments.length;
  const activityIndicatorWidth = useSharedValue(segmentWidth); // Width of the activity indicator
  const selectedIndexValue = useSharedValue(selectedIndex);

  useEffect(() => {
    selectedIndexValue.value = withSpring(selectedIndex, {
      mass: 2,
      damping: 24,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 1,
    });
  }, [selectedIndex, selectedIndexValue, animationDuration]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      selectedIndexValue.value,
      [0, segments.length],
      [0, activityIndicatorWidth.value * segments.length],
    );

    return {
      transform: [{ translateX }],
      width: `${segmentWidth * 100}%`,
      height: '120%',
      top: '-10%',
    };
  });

  const handleSegmentPress = (index: number) => {
    if (disabled || segments[index]?.disabled || index === selectedIndex) {
      return;
    }

    trigger('selection');
    onSelectionChange(index, segments[index]);
  };

  const measureActivityIndicator = (event: LayoutChangeEvent) => {
    activityIndicatorWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <View
      style={[
        themedStyles.container,
        {
          borderColor,
          borderRadius,
          padding,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {/* Animated indicator */}
      <Animated.View
        onLayout={measureActivityIndicator}
        style={[
          themedStyles.indicator,
          {
            backgroundColor: selectedBackgroundColor,
            borderRadius: borderRadius - padding,
          },
          animatedIndicatorStyle,
        ]}
      />

      {/* Segments */}
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;
        const isSegmentDisabled = segment.disabled || disabled;

        return (
          <TouchableOpacity
            key={`${segment.label}-${index}`}
            style={[
              themedStyles.segment,
              direction === 'row'
                ? themedStyles.rowSegment
                : themedStyles.columnSegment,
              {
                opacity: isSegmentDisabled ? 0.4 : 1,
              },
            ]}
            onPress={() => handleSegmentPress(index)}
            disabled={isSegmentDisabled}
            activeOpacity={0.7}
          >
            {segment.icon &&
              React.cloneElement(segment?.icon as React.ReactElement, {
                color: isSelected ? selectedTextColor : textColor,
              })}
            <Typography
              fontSize={fontSize}
              fontWeight={fontWeight}
              color={isSelected ? selectedTextColor : textColor}
              textAlign="center"
              lineHeight={0}
              numberOfLines={1}
            >
              {segment.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colorTheme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      position: 'relative',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colorTheme.border,
      borderCurve: 'continuous',
      backgroundColor: colorTheme.background,
    },
    indicator: {
      backgroundColor: colorTheme.colors.primary,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderCurve: 'continuous',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    segment: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    rowSegment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    columnSegment: {
      flexDirection: 'column',
      gap: 8,
    },
  });
