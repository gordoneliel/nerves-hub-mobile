import React from "react";
import {
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { Card } from "../components/ui";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";
import { useMe } from "../hooks/useApi";
import { Button } from "../components/button";
import { Card as CardComponent } from "../components/card";

import GroupIcon from "../../assets/icons/group.svg";
import CheckShieldIcon from "../../assets/icons/check-shield.svg";
import KeyIcon from "../../assets/icons/key.svg";
import CogIcon from "../../assets/icons/cog.svg";
import StackIcon from "../../assets/icons/stack.svg";

import UserIcon from "../../assets/icons/user-regular.svg";
import CopyIcon from "../../assets/icons/copy.svg";
import { NervesHubLogo } from "../components/NervesHubLogo";
import { trigger } from "react-native-haptic-feedback";

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
      color={colors.textTertiary}
    >
      {title}
    </Typography>
  );
}

export default function SettingsScreen() {
  const { colors, mode } = useTheme();
  const navigation = useNavigation<any>();
  const { logout, instanceUrl } = useAuth();
  const { orgId, productId, resetOrgAndProduct } = useOrgProduct();
  const { data: meData } = useMe();
  const user = meData?.data;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        {/* <SectionLabel title="Account" /> */}
        <Card>
          <View style={styles.navRow}>
            <UserIcon width={20} height={20} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                {user?.name ?? "—"}
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                {user?.email ?? "—"}
              </Typography>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel title="Current Product" />
        <CardComponent onPress={() => navigation.navigate("OrgProductModal")}>
          <View style={styles.navRow}>
            <StackIcon width={20} height={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
                color={colors.textPrimary}
              >
                {productId ?? "—"}
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                {orgId ?? "—"}
              </Typography>
            </View>
            <Typography type="header" fontSize={22} color={colors.textTertiary}>
              ›
            </Typography>
          </View>
        </CardComponent>
      </View>

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
            <View style={styles.instanceLabel}>
              <NervesHubLogo size={14} />
              <Typography
                type="body"
                fontType="mono"
                fontSize={13}
                color={colors.textSecondary}
                flexShrink={1}
              >
                {instanceUrl ?? "—"}
              </Typography>
            </View>
            {instanceUrl && (
              <CopyIcon width={18} height={18} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel title="Organization" />
        <CardComponent onPress={() => navigation.navigate("OrgUsers")}>
          <View style={styles.navRow}>
            <GroupIcon width={20} height={20} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                Users
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                Manage members of {orgId}
              </Typography>
            </View>
            <Typography type="header" fontSize={22} color={colors.textTertiary}>
              ›
            </Typography>
          </View>
        </CardComponent>
        <CardComponent onPress={() => navigation.navigate("CACertificates")}>
          <View style={styles.navRow}>
            <CheckShieldIcon
              width={20}
              height={20}
              color={colors.textSecondary}
            />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                CA Certificates
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                View certificates for {orgId}
              </Typography>
            </View>
            <Typography type="header" fontSize={22} color={colors.textTertiary}>
              ›
            </Typography>
          </View>
        </CardComponent>
        <CardComponent onPress={() => navigation.navigate("SigningKeys")}>
          <View style={styles.navRow}>
            <KeyIcon width={20} height={20} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                Signing Keys
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                View signing keys for {orgId}
              </Typography>
            </View>
            <Typography type="header" fontSize={22} color={colors.textTertiary}>
              ›
            </Typography>
          </View>
        </CardComponent>
      </View>

      <View style={styles.section}>
        <SectionLabel title="Preferences" />
        <CardComponent onPress={() => navigation.navigate("Appearance")}>
          <View style={styles.navRow}>
            <CogIcon width={20} height={20} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                Appearance
              </Typography>
              <Typography
                type="body"
                fontSize={12}
                color={colors.textSecondary}
              >
                {mode === "system"
                  ? "System"
                  : mode === "dark"
                    ? "Dark"
                    : "Light"}{" "}
                theme
              </Typography>
            </View>
            <Typography type="header" fontSize={22} color={colors.textTertiary}>
              ›
            </Typography>
          </View>
        </CardComponent>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  instanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  instanceLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  switchButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoutWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
