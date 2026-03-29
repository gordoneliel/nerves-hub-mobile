import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { TextInput } from "../../../components/text-input";
import { Button } from "../../../components/button";
import { Tag } from "../../../components/tag";
import { useOrgProduct } from "../../../context/OrgProductContext";
import { getListDevicesQueryKey } from "../../../api/generated/devices/devices";
import { customInstance } from "../../../api/mutator/custom-instance";

import CloseIcon from "../../../../assets/icons/close-big.svg";

export default function NewDeviceScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();

  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [updatesEnabled, setUpdatesEnabled] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: { type: "sfSymbol", name: "xmark" },
          onPress: () => navigation.goBack(),
        },
      ],
    });
  }, [navigation]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const canSubmit = !!identifier.trim() && !!orgId && !!productId;

  const handleCreate = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await customInstance({
        url: `/orgs/${orgId}/products/${productId}/devices`,
        method: "POST",
        data: {
          identifier: identifier.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(tags.length > 0 ? { tags: tags.join(",") } : {}),
          updates_enabled: updatesEnabled,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getListDevicesQueryKey(orgId!, productId!),
      });
      Alert.alert("Success", `Device "${identifier.trim()}" created.`);
      navigation.goBack();
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors ||
        err?.message ||
        "Failed to create device.";
      Alert.alert(
        "Error",
        typeof msg === "string" ? msg : JSON.stringify(msg),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    orgId,
    productId,
    identifier,
    description,
    tags,
    updatesEnabled,
    queryClient,
    navigation,
  ]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Typography
          type="header"
          fontSize={24}
          fontWeight="600"
          lineHeight={28}
          paddingBottom={spacing.lg}
        >
          New Device
        </Typography>

        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Identifier
          </Typography>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. device-001"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Description (optional)
          </Typography>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Kitchen sensor"
            autoCapitalize="sentences"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Tags (optional)
          </Typography>
          <View style={styles.tagInputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag..."
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
            </View>
            <Button
              label="Add"
              type="tertiary"
              size="sm"
              onPress={addTag}
              disabled={!tagInput.trim() || tags.includes(tagInput.trim())}
            />
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsPreview}>
              {tags.map((tag) => (
                <Pressable key={tag} onPress={() => removeTag(tag)}>
                  <Tag
                    label={tag}
                    size="sm"
                    colorScheme="white"
                    hasBorder
                    iconRight={{
                      component: CloseIcon,
                      props: {
                        width: 10,
                        height: 10,
                        color: colors.textTertiary,
                      },
                    }}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.switchRow}>
          <Typography type="body" fontSize={15} color={colors.textPrimary}>
            Updates enabled
          </Typography>
          <Switch value={updatesEnabled} onValueChange={setUpdatesEnabled} trackColor={{ true: colors.accent }} />
        </View>

        <View style={styles.actions}>
          <Button
            label="Create Device"
            type="primary"
            size="lg"
            fullWidth
            onPress={handleCreate}
            isLoading={submitting}
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 130,
    paddingBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  tagInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  tagsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  actions: {
    marginTop: spacing.md,
  },
});
