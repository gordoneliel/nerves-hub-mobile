import React, { ReactNode, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { trigger } from 'react-native-haptic-feedback';
import { BlurView } from '@react-native-community/blur';

import { Typography } from '../typography';

export interface TooltipProps {
  /**
   * The content to display inside the tooltip
   */
  content: string;
  /**
   * The element that will trigger the tooltip
   */
  children: ReactNode;
  /**
   * Whether the tooltip is visible
   */
  visible: boolean;
  /**
   * The position of the tooltip relative to the children
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /**
   * Additional styles for the tooltip container
   */
  containerStyle?: ViewStyle;
  /**
   * The background color of the tooltip
   */
  backgroundColor?: string;
  /**
   * The text color of the tooltip content
   */
  textColor?: string;
  /**
   * The duration of the fade animation in milliseconds
   */
  animationDuration?: number;
  /**
   * Additional vertical offset in pixels
   * Positive values move the tooltip downward if position is top, positive values move it upward if position is bottom
   */
  yOffset?: number;
  /**
   * Whether to show a close button
   */
  showCloseButton?: boolean;
  /**
   * Whether to show a backdrop
   */
  showBackdrop?: boolean;
  /**
   * Callback when the close button is pressed
   */
  onClose?: () => void;
  /**
   * Optional content to render below the text content
   */
  bottomContent?: ReactNode;
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export function Tooltip({
  content,
  children,
  visible,
  position = 'top',
  containerStyle,
  backgroundColor = '#0876FDF5',
  textColor = '#E6F1FF',
  animationDuration = 200,
  yOffset = 0,
  showCloseButton = false,
  showBackdrop = false,
  onClose,
  bottomContent,
}: TooltipProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      trigger('selection');
      // Animate in
      opacity.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withSequence(
        withTiming(0.95, {
          duration: animationDuration * 0.6,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(1, {
          duration: animationDuration * 0.4,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      );
    } else {
      // Animate out
      opacity.value = withTiming(0, {
        duration: animationDuration * 0.8,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withTiming(0.9, {
        duration: animationDuration * 0.8,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible, opacity, scale, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const getPositionStyle = (): ViewStyle => {
    const baseOffset = 8;

    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          marginBottom: baseOffset + yOffset * -1, // Negative yOffset moves tooltip up
          alignSelf: 'center',
        };
      case 'bottom':
        return {
          top: '100%',
          // bottom: yOffset, // Positive yOffset moves tooltip up
          marginTop: baseOffset,
          alignSelf: 'center',
        };
      case 'left':
        return {
          right: '100%',
          marginRight: baseOffset,
          alignSelf: 'center',
          marginTop: yOffset, // Apply yOffset for vertical adjustment
        };
      case 'right':
        return {
          left: '100%',
          marginLeft: baseOffset,
          alignSelf: 'center',
          marginTop: yOffset, // Apply yOffset for vertical adjustment
        };
      case 'center':
        return {
          position: 'absolute',
          alignSelf: 'center',
          justifyContent: 'center',
          top: '50%',
          marginTop: yOffset, // Apply yOffset to center position
          transform: [{ translateX: -50 }, { translateY: -50 }],
        };
      default:
        return {
          bottom: '100%',
          marginBottom: baseOffset + yOffset * -1,
          alignSelf: 'center',
        };
    }
  };

  const getArrowStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return {
          bottom: -6,
          transform: [{ rotate: '45deg' }],
          alignSelf: 'center',
        };
      case 'bottom':
        return {
          top: -6,
          transform: [{ rotate: '225deg' }], // Point upward
          alignSelf: 'center',
        };
      case 'left':
        return {
          right: -5,
          top: '70%',
          transform: [{ rotate: '315deg' }], // Point rightward
        };
      case 'right':
        return {
          left: -5,
          top: '70%',
          transform: [{ rotate: '135deg' }], // Point leftward
        };
      case 'center':
        return {
          top: -6,
          transform: [{ rotate: '225deg' }], // Point upward
          alignSelf: 'center',
          // display: 'none', // Hide arrow for center position
        };
      default:
        return {
          bottom: -6,
          transform: [{ rotate: '45deg' }],
          alignSelf: 'center',
        };
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      {showBackdrop && visible && (
        <View
          style={[
            styles.backdrop,
            { width: width + 2000, height: height + 2000 },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              blurType="light"
              blurAmount={5}
              reducedTransparencyFallbackColor="white"
              blurRadius={10}
              style={styles.blurView}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
              ]}
            />
          )}
          <Pressable style={styles.backdropTouchable} onPress={handleClose} />
        </View>
      )}

      {children}
      {visible && (
        <Animated.View
          style={[
            styles.tooltipContainer,
            getPositionStyle(),
            { backgroundColor },
            animatedStyle,
            containerStyle,
          ]}
        >
          <View style={[styles.arrow, getArrowStyle(), { backgroundColor }]} />
          <View style={styles.contentContainer}>
            <Typography
              fontSize={15}
              color={textColor}
              fontWeight={500}
              fontType="native"
              lineHeight={20}
              flex={1}
              textAlign="left"
            >
              {content}
            </Typography>

            {showCloseButton && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <View style={[styles.closeIcon, { borderColor: textColor }]}>
                  <View
                    style={[
                      styles.closeIconLine,
                      { backgroundColor: textColor },
                    ]}
                  />
                  <View
                    style={[
                      styles.closeIconLine,
                      styles.closeIconLineRotated,
                      { backgroundColor: textColor },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {bottomContent && (
            <View style={styles.bottomContentContainer}>{bottomContent}</View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  backdrop: {
    position: 'absolute',
    top: -1000, // Extend beyond container bounds
    left: -1000,
    zIndex: 9998, // Above all content but below the tooltip
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tooltipContainer: {
    position: 'absolute',
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    maxWidth: 310,
    zIndex: 10000, // Above the backdrop
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 4,
        blurRadius: 12,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.08)',
      },
      {
        offsetX: 1,
        offsetY: 0,
        blurRadius: 12,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.06)',
      },
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 1,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  closeIconLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeIconLineRotated: {
    transform: [{ rotate: '135deg' }],
  },
  arrow: {
    position: 'absolute',
    width: 16,
    height: 18,
    borderRadius: 3,
    zIndex: 9999,
  },
  bottomContentContainer: {
    marginTop: 16,
  },
});
