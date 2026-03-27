import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { Typography } from '../typography';
import { Button } from '../button';

import { SegmentedControl } from './index';

export function SegmentedControlExample() {
  const [basicSelectedIndex, setBasicSelectedIndex] = useState(0);
  const [timeSelectedIndex, setTimeSelectedIndex] = useState(1);
  const [filterSelectedIndex, setFilterSelectedIndex] = useState(0);
  const [twoSegmentIndex, setTwoSegmentIndex] = useState(0);
  const [customStyledIndex, setCustomStyledIndex] = useState(2);
  const [disabledIndex, setDisabledIndex] = useState(0);
  const [longLabelsIndex, setLongLabelsIndex] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Typography fontSize={24} fontWeight={600} marginBottom={24}>
          SegmentedControl Examples
        </Typography>

        <Typography fontSize={16} fontWeight={500} marginBottom={16}>
          Basic Usage
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'All' },
              { label: 'Active' },
              { label: 'Completed' },
            ]}
            selectedIndex={basicSelectedIndex}
            onSelectionChange={(index, segment) => {
              setBasicSelectedIndex(index);
              console.log('Selected:', segment.label);
            }}
          />
          <Typography fontSize={14} color="#64748B" marginTop={8}>
            Selected: {['All', 'Active', 'Completed'][basicSelectedIndex]}
          </Typography>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Time Period Selector
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Day' },
              { label: 'Week' },
              { label: 'Month' },
              { label: 'Year' },
            ]}
            selectedIndex={timeSelectedIndex}
            onSelectionChange={index => setTimeSelectedIndex(index)}
            backgroundColor="#F8FAFC"
            selectedBackgroundColor="#10B981"
            borderColor="#D1FAE5"
            animationDuration={250}
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Two Segments
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[{ label: 'List' }, { label: 'Grid' }]}
            selectedIndex={twoSegmentIndex}
            onSelectionChange={index => setTwoSegmentIndex(index)}
            backgroundColor="#FEF3F2"
            selectedBackgroundColor="#F97316"
            textColor="#FB923C"
            selectedTextColor="#FFFFFF"
            borderColor="#FED7AA"
            borderRadius={8}
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Filter Options
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Recent' },
              { label: 'Popular' },
              { label: 'Trending' },
              { label: 'Featured' },
              { label: 'New' },
            ]}
            selectedIndex={filterSelectedIndex}
            onSelectionChange={index => setFilterSelectedIndex(index)}
            fontSize={14}
            fontWeight={600}
            padding={3}
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Dark Theme Style
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Photos' },
              { label: 'Videos' },
              { label: 'Audio' },
            ]}
            selectedIndex={customStyledIndex}
            onSelectionChange={index => setCustomStyledIndex(index)}
            backgroundColor="#1F2937"
            selectedBackgroundColor="#3B82F6"
            textColor="#9CA3AF"
            selectedTextColor="#FFFFFF"
            borderColor="#374151"
            borderRadius={10}
            fontSize={15}
            fontWeight={500}
            animationDuration={300}
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          With Disabled Segments
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Available' },
              { label: 'Pending', disabled: true },
              { label: 'Processing', disabled: true },
              { label: 'Completed' },
            ]}
            selectedIndex={disabledIndex}
            onSelectionChange={index => setDisabledIndex(index)}
          />
          <Typography fontSize={12} color="#64748B" marginTop={8}>
            Some segments are disabled
          </Typography>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Longer Labels
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Dashboard' },
              { label: 'Analytics' },
              { label: 'Settings' },
            ]}
            selectedIndex={longLabelsIndex}
            onSelectionChange={index => setLongLabelsIndex(index)}
            fontSize={14}
            backgroundColor="#F1F5F9"
            selectedBackgroundColor="#8B5CF6"
            textColor="#64748B"
            selectedTextColor="#FFFFFF"
            borderColor="#E2E8F0"
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Completely Disabled
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Option 1' },
              { label: 'Option 2' },
              { label: 'Option 3' },
            ]}
            selectedIndex={1}
            onSelectionChange={() => {}}
            disabled={true}
          />
          <Typography fontSize={12} color="#64748B" marginTop={8}>
            Entire control is disabled
          </Typography>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Custom Container Styling
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Small' },
              { label: 'Medium' },
              { label: 'Large' },
            ]}
            selectedIndex={1}
            onSelectionChange={() => {}}
            containerStyle={styles.customContainer}
            backgroundColor="#FEF7FF"
            selectedBackgroundColor="#A855F7"
            textColor="#A855F7"
            selectedTextColor="#FFFFFF"
            borderColor="#E9D5FF"
            borderRadius={16}
            padding={6}
            fontSize={16}
            fontWeight={600}
          />
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Interactive Demo
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: 'Tab 1' },
              { label: 'Tab 2' },
              { label: 'Tab 3' },
            ]}
            selectedIndex={basicSelectedIndex}
            onSelectionChange={index => setBasicSelectedIndex(index)}
          />

          <View style={styles.demoContent}>
            <Typography fontSize={18} fontWeight={600} marginBottom={12}>
              Content for Tab {basicSelectedIndex + 1}
            </Typography>
            <Typography fontSize={14} color="#64748B" lineHeight={20}>
              {basicSelectedIndex === 0 &&
                'This is the content for the first tab. You can switch between tabs using the segmented control above.'}
              {basicSelectedIndex === 1 &&
                'This is the content for the second tab. The segmented control makes it easy to switch between different views.'}
              {basicSelectedIndex === 2 &&
                'This is the content for the third tab. Each tab can display completely different content based on the selection.'}
            </Typography>
          </View>

          <View style={styles.resetButton}>
            <Button
              label="Reset to First Tab"
              type="secondary"
              size="sm"
              onPress={() => setBasicSelectedIndex(0)}
            />
          </View>
        </View>

        <Typography
          fontSize={16}
          fontWeight={500}
          marginTop={24}
          marginBottom={16}
        >
          Performance Test (Fast Switching)
        </Typography>

        <View style={styles.section}>
          <SegmentedControl
            segments={[
              { label: '1' },
              { label: '2' },
              { label: '3' },
              { label: '4' },
              { label: '5' },
            ]}
            selectedIndex={timeSelectedIndex % 5}
            onSelectionChange={index => setTimeSelectedIndex(index)}
            animationDuration={150}
          />

          <View style={styles.resetButton}>
            <Button
              label="Auto Cycle"
              type="primary"
              size="sm"
              onPress={() => {
                setTimeSelectedIndex(prev => (prev + 1) % 5);
              }}
            />
          </View>
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
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
  },
  customContainer: {
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoContent: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
