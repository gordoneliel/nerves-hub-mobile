import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
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

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { TextInput } from "../../components/text-input";
import { Button } from "../../components/button";
import { Tag } from "../../components/tag";
import { Dropdown, type DropDownItem } from "../../components/dropdown";
import { useOrgProduct } from "../../context/OrgProductContext";
import { useFirmware } from "../../hooks/useApi";
import { customInstance } from "../../api/mutator/custom-instance";
import { getListDeploymentGroupsQueryKey } from "../../api/generated/deployment-groups/deployment-groups";
import type { Firmware } from "../../api/generated/schemas";

import CloseIcon from "../../../assets/icons/close-big.svg";

export default function NewDeploymentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const firmwareQuery = useFirmware();

  const [name, setName] = useState("");
  const [selectedFirmwareUuid, setSelectedFirmwareUuid] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedArchitecture, setSelectedArchitecture] = useState<string | null>(null);
  const [version, setVersion] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isActive, setIsActive] = useState(false);
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

  const firmwareItems: DropDownItem<string>[] = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    return firmwares.map((fw: Firmware) => ({
      id: String(fw.uuid),
      label: `v${fw.version ?? "?"} — ${fw.platform ?? ""} ${fw.architecture ?? ""}`.trim(),
      value: fw.uuid!,
    }));
  }, [firmwareQuery.data]);

  const platformItems: DropDownItem<string>[] = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    const unique = [...new Set(firmwares.map((fw: Firmware) => fw.platform).filter(Boolean))] as string[];
    return unique.map((p) => ({ id: p, label: p, value: p }));
  }, [firmwareQuery.data]);

  const architectureItems: DropDownItem<string>[] = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    const unique = [...new Set(firmwares.map((fw: Firmware) => fw.architecture).filter(Boolean))] as string[];
    return unique.map((a) => ({ id: a, label: a, value: a }));
  }, [firmwareQuery.data]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const canSubmit = !!name.trim() && !!selectedFirmwareUuid;

  const handleCreate = useCallback(async () => {
    if (!orgId || !productId || !canSubmit) return;
    setSubmitting(true);
    try {
      await customInstance({
        url: `/api/orgs/${orgId}/products/${productId}/deployments`,
        method: "POST",
        data: {
          name: name.trim(),
          firmware: selectedFirmwareUuid,
          conditions: {
            ...(version.trim() ? { version: version.trim() } : {}),
            ...(tags.length > 0 ? { tags } : {}),
            ...(selectedPlatform ? { platform: selectedPlatform } : {}),
            ...(selectedArchitecture ? { architecture: selectedArchitecture } : {}),
          },
          is_active: isActive,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
      });
      Alert.alert("Success", `Deployment "${name.trim()}" created.`);
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.errors || err?.message || "Failed to create deployment.";
      Alert.alert("Error", typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  }, [orgId, productId, name, selectedFirmwareUuid, selectedPlatform, selectedArchitecture, isActive, version, tags, canSubmit, queryClient, navigation]);

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
          New Deployment
        </Typography>

        {/* Name */}
        <View style={styles.field}>
          <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
            Name
          </Typography>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. production, staging"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Platform & Architecture */}
        <View style={styles.row}>
          <View style={styles.rowField}>
            <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
              Platform
            </Typography>
            <Dropdown
              items={platformItems}
              isLoading={firmwareQuery.isLoading}
              placeholderLabel="Platform…"
              size="md"
              fullItemsWidth
              onSelect={(item) => setSelectedPlatform(item.value ?? null)}
            />
          </View>
          <View style={styles.rowField}>
            <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
              Architecture
            </Typography>
            <Dropdown
              items={architectureItems}
              isLoading={firmwareQuery.isLoading}
              placeholderLabel="Architecture…"
              size="md"
              fullItemsWidth
              onSelect={(item) => setSelectedArchitecture(item.value ?? null)}
            />
          </View>
        </View>

        {/* Firmware */}
        <View style={styles.field}>
          <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
            Firmware
          </Typography>
          <Dropdown
            items={firmwareItems}
            isLoading={firmwareQuery.isLoading}
            placeholderLabel="Select firmware…"
            size="md"
            fullItemsWidth
            onSelect={(item) => setSelectedFirmwareUuid(item.value ?? null)}
          />
        </View>

        {/* Version Condition */}
        <View style={styles.field}>
          <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
            Version Condition (optional)
          </Typography>
          <TextInput
            value={version}
            onChangeText={setVersion}
            placeholder="e.g. >= 1.0.0"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <Typography type="caption" fontSize={12} color={colors.textTertiary} paddingBottom={spacing.xs}>
            Tags (optional)
          </Typography>
          <View style={styles.tagInputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag…"
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
                      props: { width: 10, height: 10, color: colors.textTertiary },
                    }}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Active toggle */}
        <View style={styles.switchRow}>
          <Typography type="body" fontSize={15} color={colors.textPrimary}>
            Activate immediately
          </Typography>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        {/* Submit */}
        <View style={styles.actions}>
          <Button
            label="Create Deployment"
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
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rowField: {
    flex: 1,
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
