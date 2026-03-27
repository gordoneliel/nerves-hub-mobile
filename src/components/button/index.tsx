import React, { useMemo, useCallback } from 'react';
import {
  TouchableOpacityProps,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
} from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '../typography';
import { LoadingIndicator } from '../loading-indicator';
import useThemedStyles from '../../theme/useThemedStyles';
import { ColorTheme } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { BUTTON_SIZES, getButtonVariants } from './config';
import {
  isLiquidGlassSupported,
  LiquidGlassView,
} from '@callstack/liquid-glass';

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'link'
  | 'icon';
type ButtonSize = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  iconLeft?: React.ReactElement;
  iconRight?: React.ReactElement;
  fullWidth?: boolean;
  type?: ButtonType;
  showUnderline?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  pill?: boolean;
  shadowEnabled?: boolean;
  textColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button(props: ButtonProps) {
  const {
    isLoading,
    onPress,
    iconLeft,
    type = 'primary',
    iconRight,
    fullWidth = false,
    size = 'lg',
    shadowEnabled = true,
    pill = true,
    textColor,
    showUnderline = true,
    ...rest
  } = props;

  const themedStyles = useThemedStyles(createStyles);
  const { colors: themeColors } = useTheme();
  const buttonVariants = useMemo(() => getButtonVariants(themeColors), [themeColors]);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Memoize expensive style calculations
  const styleConfig = useMemo(() => {
    const sizeConfig = BUTTON_SIZES[size];
    const variantConfig = buttonVariants[type];
    const borderRadius = pill
      ? sizeConfig.borderRadius
      : type === 'icon'
      ? 16
      : Math.min(sizeConfig.borderRadius, 20);
    const finalTextColor = textColor || variantConfig.textColor;

    return { sizeConfig, variantConfig, borderRadius, finalTextColor };
  }, [size, type, pill, textColor, buttonVariants]);

  const containerStyle = useMemo(
    () => [
      themedStyles.container,
      {
        height: styleConfig.sizeConfig.height,
        borderRadius: styleConfig.borderRadius,
        backgroundColor: styleConfig.variantConfig.backgroundColor,
        borderColor: styleConfig.variantConfig.borderColor,
        borderWidth: styleConfig.variantConfig.borderWidth,
        paddingHorizontal:
          type === 'link' ? 0 : styleConfig.sizeConfig.paddingHorizontal,
        opacity: props.disabled ? 0.4 : 1,
      },
      fullWidth && themedStyles.fullWidth,
      shadowEnabled && type !== 'link' && themedStyles.shadow,
      type === 'icon' && {
        width: styleConfig.sizeConfig.height,
        height: styleConfig.sizeConfig.height,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 0,
        padding: 0,
      },
      rest.style,
      animatedStyle,
    ],
    [
      styleConfig,
      fullWidth,
      shadowEnabled,
      type,
      props.disabled,
      themedStyles,
      rest.style,
      animatedStyle,
    ],
  );

  const handlePressIn = useCallback(() => {
    trigger('impactLight');
    scale.value = withTiming(0.98, { duration: 100 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 100 });
  }, [scale]);

  function handlePress(e: GestureResponderEvent) {
    onPress?.(e);
  }

  const buttonContent = (
    <>
      {!isLoading && iconLeft}
      {!isLoading && props.label && (
        <Typography
          fontSize={styleConfig.sizeConfig.fontSize}
          color={styleConfig.finalTextColor}
          fontWeight={600}
          lineHeight={undefined}
          textDecorationLine={
            type === 'link' && showUnderline ? 'underline' : 'none'
          }
        >
          {props.label}
        </Typography>
      )}
      {isLoading && (
        <LoadingIndicator size={18} color={styleConfig.finalTextColor} />
      )}
      {!isLoading && iconRight}
    </>
  );

  if (isLiquidGlassSupported && type !== 'link') {
    return (
      <LiquidGlassView
        style={[
          themedStyles.liquidGlass,
          {
            height: styleConfig.sizeConfig.height,
            borderRadius: styleConfig.borderRadius,
            opacity: props.disabled ? 0.4 : 1,
          },
          fullWidth && themedStyles.fullWidth,
        ]}
        effect="regular"
        interactive
      >
        <Pressable
          {...rest}
          onPress={handlePress}
          style={[
            themedStyles.liquidGlassInner,
            {
              borderRadius: styleConfig.borderRadius,
              backgroundColor: styleConfig.variantConfig.backgroundColor,
              height: styleConfig.sizeConfig.height,
              paddingHorizontal: styleConfig.sizeConfig.paddingHorizontal,
            },
            type === 'icon' && {
              width: styleConfig.sizeConfig.height,
              height: styleConfig.sizeConfig.height,
              padding: 0,
            },
          ]}
        >
          {buttonContent}
        </Pressable>
      </LiquidGlassView>
    );
  }

  return (
    <AnimatedPressable
      {...rest}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={containerStyle}
    >
      {buttonContent}
    </AnimatedPressable>
  );
}

const createStyles = (_theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      height: 60,
      borderCurve: 'continuous',
      backgroundColor: '#121921',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
    },
    shadow: {
      boxShadow: [
        {
          offsetX: 0,
          offsetY: 2,
          blurRadius: 6,
          spreadDistance: 0,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        {
          offsetX: 0,
          offsetY: 0,
          blurRadius: 1,
          spreadDistance: 0,
          color: 'rgba(0, 0, 0, 0.02)',
        },
      ],
    },
    fullWidth: { width: '100%' },
    liquidGlass: {
      borderCurve: 'continuous',
    },
    liquidGlassInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
  });
