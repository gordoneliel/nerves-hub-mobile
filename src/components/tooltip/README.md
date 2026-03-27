# Tooltip Component

A customizable tooltip component for React Native with smooth fade-in and scale animations using React Native Reanimated.

## Features

- Smooth fade-in and scale animations
- Customizable positioning (top, bottom, left, right, center)
- Directional arrows that point toward the target element
- Vertical offset adjustment for precise positioning
- Optional close button for user dismissal
- Customizable styling (background color, text color, etc.)
- Adjustable animation duration
- Simple API

## Usage

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { Tooltip } from '../components/tooltip';

export function MyComponent() {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Tooltip
        content="This is a helpful tooltip message"
        visible={tooltipVisible}
        position="top"
        yOffset={-10}
        showCloseButton={true}
        onClose={() => setTooltipVisible(false)}
      >
        <Button
          title="Show Tooltip"
          onPress={() => setTooltipVisible(!tooltipVisible)}
        />
      </Tooltip>
    </View>
  );
}
```

## Props

| Prop                | Type                                               | Default     | Description                                                                                                     |
| ------------------- | -------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `content`           | string                                             | (required)  | The text content to display inside the tooltip                                                                  |
| `children`          | ReactNode                                          | (required)  | The element that will trigger the tooltip                                                                       |
| `visible`           | boolean                                            | (required)  | Whether the tooltip is visible                                                                                  |
| `position`          | 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' | 'top'       | The position of the tooltip relative to the children                                                            |
| `containerStyle`    | ViewStyle                                          | undefined   | Additional styles for the tooltip container                                                                     |
| `backgroundColor`   | string                                             | '#0876FDF5' | The background color of the tooltip                                                                             |
| `textColor`         | string                                             | '#FFFFFF'   | The text color of the tooltip content                                                                           |
| `animationDuration` | number                                             | 200         | The duration of the animation in milliseconds                                                                   |
| `yOffset`           | number                                             | 0           | Additional vertical offset in pixels. Positive values move the tooltip downward, negative values move it upward |
| `showCloseButton`   | boolean                                            | false       | Whether to show a close button on the tooltip                                                                   |
| `onClose`           | () => void                                         | undefined   | Callback function when the close button is pressed                                                              |

## Position Options

- **top**: Displays the tooltip above the target element with an arrow pointing downward
- **bottom**: Displays the tooltip below the target element with an arrow pointing upward
- **left**: Displays the tooltip to the left of the target element with an arrow pointing rightward
- **right**: Displays the tooltip to the right of the target element with an arrow pointing leftward
- **center**: Displays the tooltip centered directly over the target element (no arrow)

## Positioning with yOffset

The `yOffset` property allows for fine-tuning the vertical position of the tooltip:

- For **top** position: Negative values move the tooltip upward, positive values move it downward
- For **bottom** position: Positive values increase the distance from the target, negative values decrease it
- For **left/right** positions: Adjusts the vertical alignment relative to the target
- For **center** position: Shifts the tooltip vertically from the center point

## Close Button

The close button appears on the right side of the tooltip content when `showCloseButton` is set to `true`. When pressed, it calls the `onClose` callback function, which you can use to set the `visible` prop to `false`.

This is useful for tooltips that should remain visible until explicitly dismissed by the user, rather than being tied to hover or press states.

## Examples

See the `example.tsx` file for more usage examples.

## Animation Details

The tooltip uses React Native Reanimated to create smooth animations:

1. **Fade-in**: The tooltip fades in with a smooth easing curve
2. **Scale**: The tooltip scales from 95% to 100% for a subtle pop effect

Both animations are synchronized for a polished user experience.
