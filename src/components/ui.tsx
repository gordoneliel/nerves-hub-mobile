import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "./typography";
import { radius, spacing } from "./tokens";

// ── Loading ──────────────────────────────────────────────────────

export function LoadingView({ message = "Loading…" }: { message?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Typography
        type="body"
        fontSize={14}
        marginTop={spacing.md}
        color={colors.textSecondary}
      >
        {message}
      </Typography>
    </View>
  );
}

// ── Error ────────────────────────────────────────────────────────

export function ErrorView({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Typography
        type="destructive"
        fontSize={20}
        fontWeight="600"
        color={colors.danger}
      >
        Error
      </Typography>
      <Typography
        type="body"
        fontSize={14}
        marginTop={spacing.sm}
        textAlign="center"
        color={colors.textSecondary}
      >
        {message}
      </Typography>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: colors.accent }]}
          onPress={onRetry}
        >
          <Typography type="body" fontSize={14} color={colors.accent}>
            Retry
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Empty ────────────────────────────────────────────────────────

export function EmptyView({
  title = "Nothing here",
  message,
}: {
  title?: string;
  message?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { paddingVertical: 24, backgroundColor: colors.background }]}>
      <Typography type="subheader" fontSize={20} fontWeight="600">
        {title}
      </Typography>
      {message && (
        <Typography
          type="body"
          fontSize={12}
          marginTop={spacing.sm}
          color={colors.textSecondary}
        >
          {message}
        </Typography>
      )}
    </View>
  );
}

// ── Online Badge ─────────────────────────────────────────────────

export function OnlineBadge({ online }: { online: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: online ? colors.successSubtle : colors.dangerSubtle,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: online ? colors.success : colors.danger },
        ]}
      />
      <Typography
        type="caption"
        fontSize={11}
        color={online ? colors.success : colors.danger}
      >
        {online ? "Online" : "Offline"}
      </Typography>
    </View>
  );
}

// ── Update Status Chip ───────────────────────────────────────────

export function UpdateStatusChip({ status }: { status: string | undefined }) {
  const { colors } = useTheme();
  if (!status) return null;

  const chipColor =
    status === "up-to-date"
      ? colors.success
      : status === "updating"
        ? colors.warning
        : colors.textSecondary;

  return (
    <View style={[styles.chip, { borderColor: chipColor }]}>
      <Typography type="caption" fontSize={11} color={chipColor}>
        {status}
      </Typography>
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────

export { Card } from "./card";

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
});
