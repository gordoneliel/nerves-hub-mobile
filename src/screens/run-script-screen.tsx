import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { Dropdown, type DropDownItem } from "../components/dropdown";
import { EmptyView, LoadingView } from "../components/ui";
import { useOrgProduct } from "../context/OrgProductContext";
import { useInfiniteDevices } from "../hooks/useApi";
import { useNavigation, type StaticScreenProps } from "@react-navigation/native";
import { useGetScript } from "../api/generated/scripts/scripts";
import { useSendScriptToDevice } from "../api/generated/devices/devices";

import SendIcon from "../../assets/icons/send.svg";
import ConsoleIcon from "../../assets/icons/console.svg";

type Props = StaticScreenProps<{ scriptId: string }>;

export default function RunScriptScreen({ route }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const scriptQuery = useGetScript(
    orgId ?? "",
    productId ?? "",
    route.params.scriptId,
    { query: { enabled: !!orgId && !!productId } },
  );
  const script = scriptQuery.data?.data;
  const runScript = useSendScriptToDevice();

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          label: "Edit",
          onPress: () => navigation.navigate("ScriptEditor", { scriptId: route.params.scriptId }),
        },
      ],
    });
  }, [navigation, route.params.scriptId]);

  const devicesQuery = useInfiniteDevices();
  const allDevices =
    devicesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(
    null,
  );
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceItems = useMemo<DropDownItem<string>[]>(
    () =>
      allDevices
        .filter((d) => d.connection_status === "connected")
        .map((d) => ({
          id: String(d.identifier),
          label: String(d.identifier),
          value: String(d.identifier),
        })),
    [allDevices],
  );

  const handleRun = useCallback(async () => {
    if (!orgId || !productId || !selectedIdentifier || !script?.id) return;
    setOutput(null);
    setError(null);
    try {
      const result = await runScript.mutateAsync({
        orgName: orgId,
        productName: productId,
        identifier: selectedIdentifier,
        nameOrId: script.id,
        params: { timeout: 30_000 },
      });
      setOutput(typeof result === "string" ? result : String(result));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to execute script.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
    }
  }, [orgId, productId, selectedIdentifier, script, runScript]);

  if (scriptQuery.isLoading) return <LoadingView message="Loading script..." />;
  if (!script) return <EmptyView title="Script Unavailable" message="This script could not be loaded." />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.section}>
        <Typography
          type="caption"
          fontSize={11}
          textTransform="uppercase"
          letterSpacing={1}
          color={colors.textTertiary}
          paddingBottom={spacing.xs}
        >
          Script
        </Typography>
        <Card>
          <Typography type="subheader" fontSize={16} fontWeight="600">
            {script.name}
          </Typography>
          {script.text ? (
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              marginTop={spacing.sm}
              color={colors.textSecondary}
              numberOfLines={8}
            >
              {script.text}
            </Typography>
          ) : null}
        </Card>
      </View>

      <View style={styles.section}>
        <Typography
          type="caption"
          fontSize={11}
          textTransform="uppercase"
          letterSpacing={1}
          color={colors.textTertiary}
          paddingBottom={spacing.xs}
        >
          Target Device
        </Typography>
        {devicesQuery.isLoading ? (
          <LoadingView message="Loading devices..." />
        ) : deviceItems.length === 0 ? (
          <EmptyView
            title="No Online Devices"
            message="No devices are currently connected."
          />
        ) : (
          <View style={styles.runRow}>
            <Dropdown
              items={deviceItems}
              placeholderLabel="Select device..."
              size="sm"
              fullWidth
              onSelect={(item) => setSelectedIdentifier(item.value ?? null)}
            />
            <Button
              label="Run"
              type="primary"
              size="sm"
              onPress={handleRun}
              isLoading={runScript.isPending}
              disabled={!selectedIdentifier || runScript.isPending}
              iconLeft={<SendIcon width={14} height={14} color="#fff" />}
            />
          </View>
        )}
      </View>

      {(output !== null || error !== null) && (
        <View style={styles.section}>
          <Typography
            type="caption"
            fontSize={11}
            textTransform="uppercase"
            letterSpacing={1}
            color={colors.textTertiary}
            paddingBottom={spacing.xs}
          >
            Output
          </Typography>
          <Card>
            <View style={styles.outputHeader}>
              <ConsoleIcon
                width={16}
                height={16}
                color={error ? colors.textDestructive : colors.accent}
              />
              <Typography
                type="caption"
                fontSize={12}
                fontWeight="600"
                color={error ? colors.textDestructive : colors.accent}
              >
                {error ? "Error" : "Result"}
              </Typography>
            </View>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={error ? colors.textDestructive : colors.textPrimary}
              marginTop={spacing.sm}
            >
              {error ?? output}
            </Typography>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  runRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  outputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
