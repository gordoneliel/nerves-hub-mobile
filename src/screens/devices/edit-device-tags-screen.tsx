import React, { useLayoutEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { TextInput } from "../../components/text-input";
import { Button } from "../../components/button";
import { Tag } from "../../components/tag";
import { useUpdateDevice, getListDevicesQueryKey } from "../../api/generated/devices/devices";
import { useQueryClient } from "@tanstack/react-query";
import { useOrgProduct } from "../../context/OrgProductContext";
import CloseIcon from "../../../assets/icons/close-big.svg";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = StaticScreenProps<{
  identifier: string;
  currentTags: string[];
}>;

export default function EditDeviceTagsScreen({ route }: Props) {
  const { identifier, currentTags } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const updateDevice = useUpdateDevice();

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: {
            type: "sfSymbol",
            name: "xmark",
          },
          onPress: () => navigation.goBack(),
        },
      ],
    });
  }, [navigation]);

  const [tags, setTags] = useState<string[]>(currentTags);
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const hasChanged =
    tags.length !== currentTags.length ||
    tags.some((t, i) => t !== currentTags[i]);

  const handleSave = () => {
    if (!orgId || !productId) return;

    updateDevice.mutate(
      {
        orgName: orgId,
        productName: productId,
        identifier,
        data: { tags: tags  },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListDevicesQueryKey(orgId!, productId!),
          });
          Alert.alert("Success", "Tags updated.");
          navigation.goBack();
        },
        onError: () => Alert.alert("Error", "Failed to update tags."),
      },
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <Typography
        type="header"
        fontSize={22}
        fontWeight="600"
        lineHeight={26}
        paddingBottom={spacing.xs}
      >
        Edit Tags
      </Typography>
      <Typography
        type="body"
        fontSize={13}
        color={colors.textSecondary}
        paddingBottom={spacing.lg}
      >
        {identifier}
      </Typography>

      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
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
          disabled={!inputValue.trim() || tags.includes(inputValue.trim())}
        />
      </View>

      {tags.length > 0 && (
        <View style={styles.preview}>
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

      <View style={styles.actions}>
        <Button
          label="Save"
          type="primary"
          size="lg"
          fullWidth
          onPress={handleSave}
          isLoading={updateDevice.isPending}
          disabled={!hasChanged}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
  },
  preview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
