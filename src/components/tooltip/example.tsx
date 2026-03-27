import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';

import { Typography } from '../typography';
import { Button } from '../button';

import { Tooltip } from './index';

export function TooltipExample() {
  const [topTooltipVisible, setTopTooltipVisible] = useState(false);
  const [bottomTooltipVisible, setBottomTooltipVisible] = useState(false);
  const [leftTooltipVisible, setLeftTooltipVisible] = useState(false);
  const [rightTooltipVisible, setRightTooltipVisible] = useState(false);
  const [centerTooltipVisible, setCenterTooltipVisible] = useState(false);
  const [offsetTooltipVisible, setOffsetTooltipVisible] = useState(false);
  const [closeButtonTooltipVisible, setCloseButtonTooltipVisible] =
    useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Typography fontSize={24} fontWeight={600} marginBottom={24}>
          Tooltip Examples
        </Typography>

        <Typography fontSize={16} fontWeight={500} marginBottom={16}>
          Position Options with Directional Arrows
        </Typography>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip appears above the button with an arrow pointing downward"
            visible={topTooltipVisible}
            position="top"
          >
            <Button
              label="Top Tooltip"
              type="primary"
              size="md"
              onPress={() => setTopTooltipVisible(!topTooltipVisible)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip appears below the button with an arrow pointing upward"
            visible={bottomTooltipVisible}
            position="bottom"
          >
            <Button
              label="Bottom Tooltip"
              type="secondary"
              size="md"
              onPress={() => setBottomTooltipVisible(!bottomTooltipVisible)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip appears to the left with an arrow pointing rightward"
            visible={leftTooltipVisible}
            position="left"
          >
            <Button
              label="Left Tooltip"
              type="tertiary"
              size="md"
              onPress={() => setLeftTooltipVisible(!leftTooltipVisible)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip appears to the right with an arrow pointing leftward"
            visible={rightTooltipVisible}
            position="right"
            backgroundColor="#0876FD"
            textColor="#FFFFFF"
          >
            <Button
              label="Right Tooltip"
              type="destructive"
              size="md"
              onPress={() => setRightTooltipVisible(!rightTooltipVisible)}
            />
          </Tooltip>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Center Position (No Arrow)
        </Typography>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip is centered directly over the button without an arrow"
            visible={centerTooltipVisible}
            position="center"
            backgroundColor="#121921"
            textColor="#FFFFFF"
            animationDuration={300}
            containerStyle={styles.centerTooltip}
          >
            <Button
              label="Center Tooltip"
              type="primary"
              size="md"
              onPress={() => setCenterTooltipVisible(!centerTooltipVisible)}
            />
          </Tooltip>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Close Button Example
        </Typography>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip has a close button that can be clicked to dismiss it"
            visible={closeButtonTooltipVisible}
            position="top"
            backgroundColor="#0876FD"
            textColor="#FFFFFF"
            showCloseButton={true}
            onClose={() => setCloseButtonTooltipVisible(false)}
          >
            <Button
              label="Tooltip with Close Button"
              type="primary"
              size="md"
              onPress={() => setCloseButtonTooltipVisible(true)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip has a close button with a different position"
            visible={closeButtonTooltipVisible}
            position="bottom"
            backgroundColor="#121921"
            textColor="#FFFFFF"
            showCloseButton={true}
            onClose={() => setCloseButtonTooltipVisible(false)}
          >
            <Button
              label="Bottom with Close Button"
              type="secondary"
              size="md"
              onPress={() => setCloseButtonTooltipVisible(true)}
            />
          </Tooltip>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Vertical Offset Examples
        </Typography>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip uses yOffset to adjust its vertical position"
            visible={offsetTooltipVisible}
            position="top"
            yOffset={-20} // Move tooltip 20px upward
            backgroundColor="#0876FD"
            textColor="#FFFFFF"
          >
            <Button
              label="Top with Offset (-20px)"
              type="primary"
              size="md"
              onPress={() => setOffsetTooltipVisible(!offsetTooltipVisible)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="This tooltip uses positive yOffset to move downward"
            visible={offsetTooltipVisible}
            position="bottom"
            yOffset={20} // Move tooltip 20px downward
            backgroundColor="#121921"
            textColor="#FFFFFF"
          >
            <Button
              label="Bottom with Offset (+20px)"
              type="secondary"
              size="md"
              onPress={() => setOffsetTooltipVisible(!offsetTooltipVisible)}
            />
          </Tooltip>
        </View>

        <View style={styles.row}>
          <Tooltip
            content="Left tooltip with vertical alignment adjusted"
            visible={offsetTooltipVisible}
            position="left"
            yOffset={-15} // Adjust vertical alignment
            backgroundColor="#0876FD"
            textColor="#FFFFFF"
          >
            <Button
              label="Left with Offset (-15px)"
              type="tertiary"
              size="md"
              onPress={() => setOffsetTooltipVisible(!offsetTooltipVisible)}
            />
          </Tooltip>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Custom Styling
        </Typography>

        <View style={styles.row}>
          <Tooltip
            content="This is a custom styled tooltip with a longer animation duration"
            visible={rightTooltipVisible}
            position="top"
            backgroundColor="#121921"
            textColor="#FFFFFF"
            animationDuration={500}
            containerStyle={styles.customTooltip}
          >
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setRightTooltipVisible(!rightTooltipVisible)}
            >
              <Typography color="#FFFFFF" fontWeight={600}>
                Custom Tooltip
              </Typography>
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  row: {
    marginVertical: 16,
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: '#121921',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  customTooltip: {
    borderRadius: 12,
    padding: 16,
  },
  centerTooltip: {
    borderRadius: 12,
    padding: 16,
    width: 200,
  },
});
