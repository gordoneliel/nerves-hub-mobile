import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import useThemedStyles from "../theme/useThemedStyles";
import type { ColorTheme } from "../theme/colors";
import { Typography } from "../components/typography";
import { TextInput } from "../components/text-input";
import { Button } from "../components/button";
import { NervesHubLogo } from "../components/NervesHubLogo";
import { LoadingView } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { storage, STORAGE_KEYS } from "../utils/storage";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";

export default function LoginScreen() {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles(createStyles);
  const { loginWithCredentials } = useAuth();
  const [instanceUrl, setInstanceUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const savedInstances = useMemo(
    () => storage.getArray<string>(STORAGE_KEYS.INSTANCE_URLS),
    [],
  );

  const handleLogin = async () => {
    const trimmedUrl = instanceUrl.trim().replace(/\/+$/, "");
    const trimmedEmail = email.trim();

    if (!trimmedUrl || !trimmedEmail || !password) {
      Alert.alert("Error", "Please enter instance URL, email, and password.");
      return;
    }

    setLoading(true);
    try {
      await loginWithCredentials(trimmedUrl, trimmedEmail, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not authenticate";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingView message="Validating credentials…" />;

  return (
    <KeyboardAvoidingView
      style={[themedStyles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={themedStyles.content}>
        <View style={themedStyles.logoContainer}>
          <NervesHubLogo size={48} />
        </View>
        <Typography
          type="body"
          fontSize={12}
          textAlign="center"
          marginTop={spacing.sm}
          marginBottom={spacing.xxl}
          color={colors.textSecondary}
        >
          Sign in to your instance
        </Typography>

        <View style={themedStyles.fields}>
          <View style={themedStyles.field}>
            <Typography
              type="body"
              fontSize={12}
              marginBottom={spacing.sm}
              color={colors.textSecondary}
            >
              Instance URL
            </Typography>
            <TextInput
              value={instanceUrl}
              onChangeText={setInstanceUrl}
              placeholder="https://manage.nervescloud.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              iconRight={
                savedInstances.length > 0 ? (
                  <ContextMenu
                    style={themedStyles.instanceDropdown}
                    actions={savedInstances.map((url) => ({ title: url }))}
                    onPress={(e) => {
                      const selected = savedInstances[e.nativeEvent.index];
                      if (selected) setInstanceUrl(selected);
                    }}
                    dropdownMenuMode
                  >
                    <View style={themedStyles.dropdownButton}>
                      <ChevronDownIcon
                        width={14}
                        height={14}
                        color={colors.textCaption}
                      />
                    </View>
                  </ContextMenu>
                ) : undefined
              }
            />
          </View>

          <View style={themedStyles.field}>
            <Typography
              type="body"
              fontSize={12}
              marginBottom={spacing.sm}
              color={colors.textSecondary}
            >
              Email
            </Typography>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="user@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={themedStyles.field}>
            <Typography
              type="body"
              fontSize={12}
              marginBottom={spacing.sm}
              color={colors.textSecondary}
            >
              Password
            </Typography>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          label="Sign In"
          onPress={handleLogin}
          fullWidth
          size="xl"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    field: {
      marginBottom: spacing.lg,
    },
    fields: {
      marginBottom: 24,
    },
    instanceDropdown: {
      paddingHorizontal: 8,
    },
    dropdownButton: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 14,
      borderCurve: "continuous",
    },
  });
