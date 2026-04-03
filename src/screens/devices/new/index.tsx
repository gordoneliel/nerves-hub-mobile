import React, { useCallback, useLayoutEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";

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

interface NewDeviceForm {
  identifier: string;
  description: string;
  tags: { value: string }[];
  updatesEnabled: boolean;
}

export default function NewDeviceScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewDeviceForm>({
    defaultValues: {
      identifier: "",
      description: "",
      tags: [],
      updatesEnabled: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  const [tagInput, setTagInput] = React.useState("");

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

  const tagValues = fields.map((f) => f.value);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || tagValues.includes(trimmed)) return;
    append({ value: trimmed });
    setTagInput("");
  }, [tagInput, tagValues, append]);

  const onSubmit = useCallback(
    async (data: NewDeviceForm) => {
      if (!orgId || !productId) return;
      try {
        await customInstance({
          url: `/orgs/${orgId}/products/${productId}/devices`,
          method: "POST",
          data: {
            identifier: data.identifier.trim(),
            ...(data.description.trim()
              ? { description: data.description.trim() }
              : {}),
            ...(data.tags.length > 0
              ? { tags: data.tags.map((t) => t.value).join(",") }
              : {}),
            updates_enabled: data.updatesEnabled,
          },
        });
        queryClient.invalidateQueries({
          queryKey: getListDevicesQueryKey(orgId, productId),
        });
        Alert.alert("Success", `Device "${data.identifier.trim()}" created.`);
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
      }
    },
    [orgId, productId, queryClient, navigation],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      // contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      alwaysBounceVertical
    >
      <Typography
        type="header"
        fontSize={26}
        fontWeight="600"
        color={colors.textPrimary}
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
        <Controller
          control={control}
          name="identifier"
          rules={{
            required: "Identifier is required",
            pattern: {
              value: /^[a-zA-Z0-9_-]+$/,
              message: "Only letters, numbers, hyphens, and underscores",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. device-001"
              autoCapitalize="none"
              autoCorrect={false}
              hasError={!!errors.identifier}
            />
          )}
        />
        {errors.identifier && (
          <Typography
            type="caption"
            fontSize={12}
            color={colors.danger}
            paddingTop={spacing.xs}
          >
            {errors.identifier.message}
          </Typography>
        )}
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
        <Controller
          control={control}
          name="description"
          rules={{
            maxLength: {
              value: 255,
              message: "Description must be 255 characters or fewer",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. Kitchen sensor"
              autoCapitalize="sentences"
              autoCorrect={false}
              hasError={!!errors.description}
            />
          )}
        />
        {errors.description && (
          <Typography
            type="caption"
            fontSize={12}
            color={colors.danger}
            paddingTop={spacing.xs}
          >
            {errors.description.message}
          </Typography>
        )}
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
            disabled={!tagInput.trim() || tagValues.includes(tagInput.trim())}
          />
        </View>
        {fields.length > 0 && (
          <View style={styles.tagsPreview}>
            {fields.map((field, index) => (
              <Pressable key={field.id} onPress={() => remove(index)}>
                <Tag
                  label={field.value}
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
        <Controller
          control={control}
          name="updatesEnabled"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: colors.accent }}
            />
          )}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label="Create Device"
          type="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
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
    paddingHorizontal: spacing.lg,
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
    marginTop: spacing.xxl,
  },
});
