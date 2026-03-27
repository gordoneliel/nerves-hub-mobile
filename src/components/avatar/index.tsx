import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AvatarProps {
  size?: number;
  source?: ImageSourcePropType;
  name?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hasShadow?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  source,
  name,
  backgroundColor = '#E1E1E1',
  textColor = '#FFFFFF',
  borderColor,
  hasShadow = false,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const containerStyle = {
    width: size,
    height: size,
    borderWidth: borderColor ? 1 : 0,
    borderColor: borderColor || 'transparent',
    borderRadius: size * 0.5,
    backgroundColor: backgroundColor,
  };

  const textStyle = {
    fontSize: size * 0.4,
    color: textColor,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              borderRadius: size * 0.5,
              ...(hasShadow ? styles.shadow : {}),
            },
          ]}
        />
      ) : name ? (
        <Text style={[styles.text, textStyle]}>{getInitials(name)}</Text>
      ) : (
        <Text style={[styles.text, textStyle]}>?</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
  },
  text: {
    fontWeight: '600',
  },
  shadow: {
    boxShadow: [
      {
        color: `${colors.gray['900']}18`,
        offsetX: 1,
        offsetY: 3,
        blurRadius: 6,
        spreadDistance: 1,
      },
    ],
  },
});
