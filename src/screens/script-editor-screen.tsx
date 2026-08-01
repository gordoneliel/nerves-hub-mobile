import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/button";
import { TextInput } from "../components/text-input";
import { Typography } from "../components/typography";
import { LoadingView } from "../components/ui";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { useOrgProduct } from "../context/OrgProductContext";
import {
  useCreateScript,
  useDeleteScript,
  useGetScript,
  useUpdateScript,
} from "../api/generated/scripts/scripts";

type Props = StaticScreenProps<{ scriptId?: string }>;

export default function ScriptEditorScreen({ route }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { orgId, productId } = useOrgProduct();
  const scriptId = route.params?.scriptId;
  const scriptQuery = useGetScript(orgId ?? "", productId ?? "", scriptId ?? "", {
    query: { enabled: !!orgId && !!productId && !!scriptId },
  });
  const createScript = useCreateScript();
  const updateScript = useUpdateScript();
  const deleteScript = useDeleteScript();
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const script = scriptQuery.data?.data;
    if (!script) return;
    setName(script.name ?? "");
    setTags(script.tags ?? "");
    setCode(script.text ?? "");
  }, [scriptQuery.data]);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [`/orgs/${orgId}/products/${productId}/scripts`],
    });

  const save = async () => {
    if (!orgId || !productId || !name.trim() || !code.trim()) return;
    const data = { name: name.trim(), tags: tags.trim(), text: code };
    try {
      if (scriptId) {
        await updateScript.mutateAsync({ orgName: orgId, productName: productId, id: scriptId, data });
      } else {
        await createScript.mutateAsync({ orgName: orgId, productName: productId, data });
      }
      await invalidate();
      navigation.goBack();
    } catch {
      Alert.alert("Error", `Failed to ${scriptId ? "update" : "create"} script.`);
    }
  };

  const remove = () => {
    if (!orgId || !productId || !scriptId) return;
    Alert.alert("Delete Script", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScript.mutateAsync({ orgName: orgId, productName: productId, id: scriptId });
            await invalidate();
            navigation.popToTop();
          } catch {
            Alert.alert("Error", "Failed to delete script.");
          }
        },
      },
    ]);
  };

  if (scriptId && scriptQuery.isLoading) return <LoadingView message="Loading script..." />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Typography type="caption" color={colors.textTertiary}>Name</Typography>
      <TextInput value={name} onChangeText={setName} placeholder="Script name" />
      <Typography type="caption" color={colors.textTertiary}>Tags</Typography>
      <TextInput value={tags} onChangeText={setTags} placeholder="diagnostics, network" />
      <Typography type="caption" color={colors.textTertiary}>Elixir code</Typography>
      <TextInput value={code} onChangeText={setCode} placeholder="IO.inspect(...)" multiline autoCapitalize="none" autoCorrect={false} style={styles.editor} />
      <View style={styles.actions}>
        <Button label={scriptId ? "Save Changes" : "Create Script"} type="primary" onPress={save} disabled={!name.trim() || !code.trim()} isLoading={createScript.isPending || updateScript.isPending} />
        {scriptId ? <Button label="Delete" type="tertiary" onPress={remove} isLoading={deleteScript.isPending} /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  editor: { minHeight: 220, alignItems: "flex-start" },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
