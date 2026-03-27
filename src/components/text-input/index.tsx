import React, {
  ReactElement,
  forwardRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  TextInput as Input,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

import useThemedStyles from '../../theme/useThemedStyles';
import { ColorTheme } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeProvider';
// Icons
// import CloseIcon from '../../../assets/icons/close-circle-filled.svg';

export interface TextInputOverlayProps extends TextInputProps {
  label?: string;
  iconRight?: ReactElement;
  iconLeft?: ReactElement;
  disabled?: boolean;
  hasError?: boolean;
  pill?: boolean;
  hasShadow?: boolean;
}

// Move ClearButton outside to prevent recreation on every render
const ClearButton = React.memo(
  ({ onPress, style }: { onPress: () => void; style: any }) => (
    <TouchableOpacity onPress={onPress} style={style}>
      {/*<CloseIcon color={colors.gray[300]} width={18} height={18} />*/}
    </TouchableOpacity>
  ),
);

export const TextInput = forwardRef<Input, TextInputOverlayProps>(
  function TextInput(props, ref) {
    const theme = useTheme()
    const themedStyles = useThemedStyles(createStyles);
    const {
      iconLeft,
      iconRight,
      disabled = false,
      pill,
      style,
      hasShadow = true,
      clearButtonMode = 'never',
      onFocus,
      onBlur,
      value,
      defaultValue,
      onChangeText,
      ...rest
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    // Internal state for unmanaged mode
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // Memoize calculated values
    const isManaged = useMemo(() => value !== undefined, [value]);
    const currentValue = useMemo(
      () => (isManaged ? value : internalValue),
      [isManaged, value, internalValue],
    );

    const shouldShowClearButton = useMemo(
      () =>
        clearButtonMode === 'while-editing' &&
        isFocused &&
        currentValue &&
        currentValue.length > 0,
      [clearButtonMode, isFocused, currentValue],
    );

    // Memoize style objects to prevent recreation
    const opacityStyle = useMemo(
      () => ({ opacity: disabled ? 0.5 : 1 }),
      [disabled],
    );
    const pillStyle = useMemo(
      () => ({ borderRadius: pill ? 30 : 20 }),
      [pill],
    );

    const containerStyle = useMemo(
      () => [
        themedStyles.container,
        hasShadow && themedStyles.shadow,
        props.hasError && themedStyles.containerError,
        opacityStyle,
        pillStyle,
        style,
      ],
      [
        themedStyles.container,
        themedStyles.shadow,
        themedStyles.containerError,
        hasShadow,
        props.hasError,
        opacityStyle,
        pillStyle,
        style,
      ],
    );

    // Use useCallback for event handlers to prevent recreation
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        // Update internal state for unmanaged mode
        if (!isManaged) {
          setInternalValue(text);
        }
        // Always call the provided onChangeText if it exists
        onChangeText?.(text);
      },
      [isManaged, onChangeText],
    );

    const handleClear = useCallback(() => {
      const clearedValue = '';
      // Update internal state for unmanaged mode
      if (!isManaged) {
        setInternalValue(clearedValue);
      }
      // Always call onChangeText to notify parent
      onChangeText?.(clearedValue);
    }, [isManaged, onChangeText]);

    const handlePress = useCallback(() => {
      if (disabled) {
        return;
      }
      if (ref && typeof ref === 'object' && 'current' in ref) {
        ref.current?.focus();
      }
    }, [disabled, ref]);

    return (
      <LiquidGlassView interactive effect='regular' colorScheme={theme.mode} style={containerStyle}>
        {iconLeft}
        <Input
          editable={!disabled}
          allowFontScaling={false}
          placeholderTextColor={themedStyles.placeholderText.color}
          style={themedStyles.input}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={isManaged ? value : internalValue}
          defaultValue={isManaged ? undefined : defaultValue}
          onChangeText={handleChangeText}
          {...rest}
        />
        <View style={themedStyles.iconContainer}>
          {iconRight}
          {shouldShowClearButton ? (
            <ClearButton
              onPress={handleClear}
              style={themedStyles.clearButton}
            />
          ) : null}
        </View>
      </LiquidGlassView>
    );
  },
);

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      height: 52,
      paddingLeft: 14,
      paddingRight: 8,
      backgroundColor: colors.backgroundSecondary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderCurve: 'continuous',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderLight,
    },
    shadow: {
      boxShadow: [
        {
          color: `${colors.black}08`,
          offsetX: 1,
          offsetY: 4,
          blurRadius: 8,
          spreadDistance: 2,
        },
        {
          color: `${colors.black}20`,
          offsetX: 0,
          offsetY: 0,
          blurRadius: 1,
          spreadDistance: 0,
        },
      ],
    },
    placeholderText: {
      color: colors.textCaption,
    },
    containerError: { borderColor: '#F73B4B80', borderWidth: 1 },
    input: {
      flex: 1,
      fontWeight: '500',
      fontSize: 16,
      color: colors.textBody,
      borderColor: colors.border,
      height: '100%',
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    clearButton: {},
  });
