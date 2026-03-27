import React, { forwardRef, useRef } from 'react';
import {
  TextInput as NativeTextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';

import { TextInput, TextInputOverlayProps } from '../text-input';
import SearchIcon from '../../../assets/icons/search.svg';
import useThemedStyles from '../../theme/useThemedStyles';
import { ColorTheme } from '../../theme/colors';

export type SearchInputProps = TextInputProps & TextInputOverlayProps;

export const SearchInput = forwardRef<NativeTextInput, SearchInputProps>(function SearchInput(props, ref) {
  const themedStyles = useThemedStyles(createStyles);
  const fallbackRef = useRef<NativeTextInput>(null);

  return (
    <TextInput
      ref={ref ?? fallbackRef}
      inputMode="search"
      pill={false}
      hasShadow={false}
      iconLeft={
        <SearchIcon
          pointerEvents="none"
          color={themedStyles.icon.color}
          width={16}
          height={16}
        />
      }
      {...props}
    />
  );
});

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    icon: {
      color: colors.textSubHeader,
    },
  });
