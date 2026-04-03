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
import { useForm, Controller } from "react-hook-form";

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

interface NewDeploymentForm {
  name: string;
  firmware: string;
  platform: string;
  architecture: string;
  version: string;
  tags: string[];
  isActive: boolean;
}

export default function NewDeploymentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const firmwareQuery = useFirmware();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewDeploymentForm>({
    defaultValues: {
      name: "",
      firmware: "",
      platform: "",
      architecture: "",
      version: "",
      tags: [],
      isActive: false,
    },
  });

  const [tagInput, setTagInput] = useState("");

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
      label:
        `v${fw.version ?? "?"} — ${fw.platform ?? ""} ${fw.architecture ?? ""}`.trim(),
      value: fw.uuid!,
    }));
  }, [firmwareQuery.data]);

  const platformItems: DropDownItem<string>[] = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    const unique = [
      ...new Set(firmwares.map((fw: Firmware) => fw.platform).filter(Boolean)),
    ] as string[];
    return unique.map((p) => ({ id: p, label: p, value: p }));
  }, [firmwareQuery.data]);

  const architectureItems: DropDownItem<string>[] = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    const unique = [
      ...new Set(
        firmwares.map((fw: Firmware) => fw.architecture).filter(Boolean),
      ),
    ] as string[];
    return unique.map((a) => ({ id: a, label: a, value: a }));
  }, [firmwareQuery.data]);


  const onSubmit = useCallback(
    async (data: NewDeploymentForm) => {
      if (!orgId || !productId) return;
      try {
        await customInstance({
          url: `/orgs/${orgId}/products/${productId}/deployments`,
          method: "POST",
          data: {
            name: data.name.trim(),
            firmware: data.firmware,
            conditions: {
              ...(data.version.trim()
                ? { version: data.version.trim() }
                : {}),
              ...(data.tags.length > 0 ? { tags: data.tags } : {}),
              ...(data.platform ? { platform: data.platform } : {}),
              ...(data.architecture
                ? { architecture: data.architecture }
                : {}),
            },
            is_active: data.isActive,
          },
        });
        queryClient.invalidateQueries({
          queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
        });
        Alert.alert("Success", `Deployment "${data.name.trim()}" created.`);
        navigation.goBack();
      } catch (err: any) {
        const msg =
          err?.response?.data?.errors ||
          err?.message ||
          "Failed to create deployment.";
        Alert.alert(
          "Error",
          typeof msg === "string" ? msg : JSON.stringify(msg),
        );
      }
    },
    [orgId, productId, queryClient, navigation],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        alwaysBounceVertical
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
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Name
          </Typography>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. production, staging"
                autoCapitalize="none"
                autoCorrect={false}
                hasError={!!errors.name}
              />
            )}
          />
          {errors.name && (
            <Typography
              type="caption"
              fontSize={12}
              color={colors.danger}
              paddingTop={spacing.xs}
            >
              {errors.name.message}
            </Typography>
          )}
        </View>

        {/* Platform & Architecture */}
        <View style={styles.row}>
          <View style={styles.rowField}>
            <Typography
              type="caption"
              fontSize={12}
              color={colors.textTertiary}
              paddingBottom={spacing.xs}
            >
              Platform
            </Typography>
            <Controller
              control={control}
              name="platform"
              render={({ field: { onChange } }) => (
                <Dropdown
                  items={platformItems}
                  isLoading={firmwareQuery.isLoading}
                  placeholderLabel="Platform…"
                  size="md"
                  fullItemsWidth
                  onSelect={(item) => onChange(item.value ?? "")}
                />
              )}
            />
          </View>
          <View style={styles.rowField}>
            <Typography
              type="caption"
              fontSize={12}
              color={colors.textTertiary}
              paddingBottom={spacing.xs}
            >
              Architecture
            </Typography>
            <Controller
              control={control}
              name="architecture"
              render={({ field: { onChange } }) => (
                <Dropdown
                  items={architectureItems}
                  isLoading={firmwareQuery.isLoading}
                  placeholderLabel="Architecture…"
                  size="md"
                  fullItemsWidth
                  onSelect={(item) => onChange(item.value ?? "")}
                />
              )}
            />
          </View>
        </View>

        {/* Firmware */}
        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Firmware
          </Typography>
          <Controller
            control={control}
            name="firmware"
            rules={{ required: "Firmware is required" }}
            render={({ field: { onChange } }) => (
              <Dropdown
                items={firmwareItems}
                isLoading={firmwareQuery.isLoading}
                placeholderLabel="Select firmware…"
                size="md"
                fullItemsWidth
                onSelect={(item) => onChange(item.value ?? "")}
              />
            )}
          />
          {errors.firmware && (
            <Typography
              type="caption"
              fontSize={12}
              color={colors.danger}
              paddingTop={spacing.xs}
            >
              {errors.firmware.message}
            </Typography>
          )}
        </View>

        {/* Version Condition */}
        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Version Condition (optional)
          </Typography>
          <Controller
            control={control}
            name="version"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. >= 1.0.0"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Tags (optional)
          </Typography>
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value: tags } }) => {
              const addTag = () => {
                const trimmed = tagInput.trim();
                if (!trimmed || tags.includes(trimmed)) return;
                onChange([...tags, trimmed]);
                setTagInput("");
              };
              return (
                <>
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
                      disabled={
                        !tagInput.trim() || tags.includes(tagInput.trim())
                      }
                    />
                  </View>
                  {tags.length > 0 && (
                    <View style={styles.tagsPreview}>
                      {tags.map((tag) => (
                        <Pressable
                          key={tag}
                          onPress={() =>
                            onChange(tags.filter((t) => t !== tag))
                          }
                        >
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
                </>
              );
            }}
          />
        </View>

        {/* Active toggle */}
        <View style={styles.switchRow}>
          <Typography type="body" fontSize={15} color={colors.textPrimary}>
            Activate immediately
          </Typography>
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: colors.accent }}
              />
            )}
          />
        </View>

        {/* Submit */}
        <View style={styles.actions}>
          <Button
            label="Create Deployment"
            type="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
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
