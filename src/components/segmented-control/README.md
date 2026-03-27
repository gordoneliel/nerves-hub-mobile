# SegmentedControl Component

A customizable segmented control component for React Native with smooth sliding animations using React Native Reanimated. Perfect for creating tab-like interfaces or option selectors with a modern iOS-style appearance.

## Features

- Smooth sliding animation between segments
- Customizable styling (colors, border radius, padding, etc.)
- Individual segment disable functionality
- TypeScript support with comprehensive interfaces
- Accessibility support
- Responsive design that adapts to segment count
- Support for custom fonts and text styling
- Shadow effects for visual depth

## Usage

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { SegmentedControl } from '../components/segmented-control';

export function MyComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const segments = [
    { label: 'All' },
    { label: 'Active' },
    { label: 'Completed' },
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <SegmentedControl
        segments={segments}
        selectedIndex={selectedIndex}
        onSelectionChange={(index, segment) => {
          setSelectedIndex(index);
          console.log('Selected:', segment.label);
        }}
      />
    </View>
  );
}
```

## Props

| Prop                      | Type                                                        | Default    | Description                               |
| ------------------------- | ----------------------------------------------------------- | ---------- | ----------------------------------------- |
| `segments`                | SegmentedControlSegment[]                                   | (required) | Array of segments to display              |
| `selectedIndex`           | number                                                      | (required) | The currently selected segment index      |
| `onSelectionChange`       | (index: number, segment: SegmentedControlSegment) => void   | (required) | Callback when a segment is selected       |
| `containerStyle`          | ViewStyle                                                   | undefined  | Additional styles for the container       |
| `segmentStyle`            | ViewStyle                                                   | undefined  | Additional styles for individual segments |
| `backgroundColor`         | string                                                      | '#F1F5F9'  | Background color of the control           |
| `selectedBackgroundColor` | string                                                      | '#0876FD'  | Background color of the selected segment  |
| `textColor`               | string                                                      | '#64748B'  | Text color for unselected segments        |
| `selectedTextColor`       | string                                                      | '#FFFFFF'  | Text color for the selected segment       |
| `borderColor`             | string                                                      | '#E2E8F0'  | Border color of the control               |
| `animationDuration`       | number                                                      | 200        | Animation duration in milliseconds        |
| `borderRadius`            | number                                                      | 12         | Border radius of the control              |
| `padding`                 | number                                                      | 4          | Padding inside the control                |
| `fontSize`                | number                                                      | 16         | Font size for segment labels              |
| `fontWeight`              | 100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900 | 500        | Font weight for segment labels            |
| `disabled`                | boolean                                                     | false      | Whether the entire control is disabled    |

## SegmentedControlSegment Interface

| Property   | Type    | Required | Description                                         |
| ---------- | ------- | -------- | --------------------------------------------------- |
| `label`    | string  | Yes      | The text to display for this segment                |
| `value`    | string  | No       | Optional value for this segment (defaults to label) |
| `disabled` | boolean | No       | Whether this specific segment is disabled           |

## Examples

### Basic Usage

```tsx
const [selectedIndex, setSelectedIndex] = useState(0);

<SegmentedControl
  segments={[{ label: 'Day' }, { label: 'Week' }, { label: 'Month' }]}
  selectedIndex={selectedIndex}
  onSelectionChange={index => setSelectedIndex(index)}
/>;
```

### Custom Styling

```tsx
<SegmentedControl
  segments={segments}
  selectedIndex={selectedIndex}
  onSelectionChange={index => setSelectedIndex(index)}
  backgroundColor="#1F2937"
  selectedBackgroundColor="#3B82F6"
  textColor="#9CA3AF"
  selectedTextColor="#FFFFFF"
  borderColor="#374151"
  borderRadius={8}
  fontSize={14}
  fontWeight={600}
/>
```

### With Disabled Segments

```tsx
<SegmentedControl
  segments={[
    { label: 'Available' },
    { label: 'Pending', disabled: true },
    { label: 'Archived' },
  ]}
  selectedIndex={selectedIndex}
  onSelectionChange={index => setSelectedIndex(index)}
/>
```

### Custom Animation Duration

```tsx
<SegmentedControl
  segments={segments}
  selectedIndex={selectedIndex}
  onSelectionChange={index => setSelectedIndex(index)}
  animationDuration={300}
/>
```

## Accessibility

The component includes built-in accessibility support:

- Each segment is properly labeled for screen readers
- Disabled segments are announced as unavailable
- Touch targets meet minimum size requirements
- Proper focus management for keyboard navigation

## Animation Details

The segmented control uses React Native Reanimated to create smooth animations:

1. **Sliding Indicator**: The selected background smoothly slides to the new position
2. **Easing**: Uses a smooth bezier curve for natural movement
3. **Performance**: Runs on the UI thread for 60fps animations

The animation automatically calculates the position based on the number of segments and current selection.

## Design Guidelines

- Use 2-5 segments for optimal usability
- Keep segment labels short and descriptive
- Ensure sufficient color contrast between states
- Consider the control's width on different screen sizes
- Use consistent styling across your app

## Examples

See the `example.tsx` file for more comprehensive usage examples including different styling options and use cases.
