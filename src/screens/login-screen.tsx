import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { TextInput } from "../components/text-input";
import { Button } from "../components/button";
import { NervesHubLogo } from "../components/NervesHubLogo";
import { LoadingView } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { loginWithCredentials } = useAuth();
  const [instanceUrl, setInstanceUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedUrl = instanceUrl.trim().replace(/\/+$/, "");
    const trimmedEmail = email.trim();

    if (!trimmedUrl || !trimmedEmail || !password) {
      Alert.alert(
        "Error",
        "Please enter instance URL, email, and password.",
      );
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <NervesHubLogo size={48} />
        </View>
        <Typography type="body" fontSize={12} textAlign="center" marginTop={spacing.sm} marginBottom={spacing.xxl} color={colors.textSecondary}>
          Sign in to your instance
        </Typography>

        <View style={styles.fields}>
        <View style={styles.field}>
          <Typography type="body" fontSize={12} marginBottom={spacing.xs} color={colors.textSecondary}>
            Instance URL
          </Typography>
          <TextInput
            value={instanceUrl}
            onChangeText={setInstanceUrl}
            placeholder="https://manage.nervescloud.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <View style={styles.field}>
          <Typography type="body" fontSize={12} marginBottom={spacing.xs} color={colors.textSecondary}>
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

        <View style={styles.field}>
          <Typography type="body" fontSize={12} marginBottom={spacing.xs} color={colors.textSecondary}>
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

const styles = StyleSheet.create({
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
    marginBottom: 24
  }
});
