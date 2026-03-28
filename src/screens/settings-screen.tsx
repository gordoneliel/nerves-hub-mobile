import React from "react";
import {
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { spacing } from "../components/tokens";
import { useTheme, type ThemeMode } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { Card } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";
import { useMe } from "../hooks/useApi";
import { Button } from "../components/button";

import CopyIcon from "../../assets/icons/copy.svg";
import { trigger } from "react-native-haptic-feedback";

const themeModes: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Typography
      type="caption"
      fontSize={11}
      textTransform="uppercase"
      letterSpacing={1}
      paddingBottom={spacing.xs}
      paddingHorizontal={spacing.lg}
      marginLeft={spacing.lg}
      color={colors.textTertiary}
    >
      {title}
    </Typography>
  );
}

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { logout, instanceUrl } = useAuth();
  const { orgId, productId, resetOrgAndProduct } = useOrgProduct();
  const { data: meData } = useMe();
  const user = meData?.data;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography
          type="header"
          fontSize={26}
          fontWeight="600"
          lineHeight={28}
          marginBottom={4}
          paddingHorizontal={spacing.lg}
          paddingTop={spacing.lg}
          paddingBottom={spacing.md}
        >
          Settings
        </Typography>

        <View style={styles.section}>
          <SectionLabel title="Instance" />
          <Card>
            <TouchableOpacity
              style={styles.instanceRow}
              activeOpacity={0.6}
              onPress={() => {
                if (instanceUrl) {
                  Clipboard.setString(instanceUrl);
                  trigger("soft");
                  Alert.alert("Copied", "Instance URL copied to clipboard.");
                }
              }}
            >
              <Typography
                type="body"
                fontType="mono"
                fontSize={13}
                color={colors.textSecondary}
                flexShrink={1}
              >
                {instanceUrl ?? "—"}
              </Typography>
              {instanceUrl && (
                <CopyIcon width={18} height={18} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionLabel title="Account" />
          <Card>
            <Typography
              type="subheader"
              fontSize={18}
              fontWeight="600"
              lineHeight={24}
            >
              {user?.name ?? "—"}
            </Typography>
            <Typography
              type="body"
              fontSize={12}
              marginTop={spacing.xs}
              color={colors.textSecondary}
            >
              {user?.email ?? "—"}
            </Typography>
          </Card>
        </View>

        {/*<View style={styles.section}>
          <SectionLabel title="Organization" />
          <Card>
            <Typography type="body" fontSize={14}>
              {orgId} / {productId}
            </Typography>
            <Button
              label="Switch Product"
              type="tertiary"
              size="sm"
              onPress={resetOrgAndProduct}
              style={styles.switchButton}
            />
          </Card>
        </View>*/}

        <View style={styles.section}>
          <SectionLabel title="Appearance" />
          <View style={styles.segmentedControlWrapper}>
            <SegmentedControl
              values={themeModes.map(({ label }) => label)}
              selectedIndex={themeModes.findIndex(
                ({ value }) => value === mode,
              )}
              onChange={(event) => {
                const index = event.nativeEvent.selectedSegmentIndex;
                setMode(themeModes[index].value);
              }}
            />
          </View>
        </View>

        <View style={styles.logoutWrapper}>
          <Button
            label="Logout"
            type="tertiary"
            size="lg"
            fullWidth
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout },
              ])
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  instanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  switchButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
  },
  segmentedControlWrapper: {
    paddingHorizontal: spacing.lg,
  },
  logoutWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
