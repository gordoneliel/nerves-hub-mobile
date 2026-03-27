import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StaticScreenProps } from "@react-navigation/native";

import { Typography } from "../../components/typography";
import { Button } from "../../components/button";
import { TextInput } from "../../components/text-input";
import { useConsoleChannel } from "../../hooks/useConsoleChannel";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { ColorTheme } from "../../theme/colors";
import type { Spacing } from "../../theme/spacing";
import SendIcon from "../../../assets/icons/send.svg";

type Props = StaticScreenProps<{ id: number }>;

interface ConsoleEntry {
  id: string;
  type: "input" | "output" | "error";
  text: string;
}

const createStyles = (colors: ColorTheme, spacing: Spacing) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingTop: 120,
    paddingHorizontal: spacing[18],
    paddingBottom: 120,
  },
  statusBar: {
    paddingHorizontal: spacing[18],
    paddingVertical: spacing[12],
    alignItems: "center" as const,
  },
  entry: {
    paddingVertical: spacing[12],
  },
  glassContainer: {
    height: 64,
    marginHorizontal: spacing[18],
  },
  input: {
    flex: 1,
    borderWidth: 0,
    shadow: "none"
  },
});

export default function DeviceConsoleScreen({ route }: Props) {
  const { id: deviceId } = route.params;
  const styles = useThemedStyles(createStyles);
  const { bottom } = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
  const [history, setHistory] = useState<ConsoleEntry[]>([]);
  const listRef = useRef<FlatList>(null);

  const onOutput = useCallback((data: string) => {
    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-out`, type: "output", text: data },
    ]);
  }, []);

  const { status, sendInput } = useConsoleChannel({
    deviceId,
    onOutput,
  });

  const handleSend = () => {
    const trimmed = code.trim();
    if (!trimmed || status !== "connected") return;

    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-in`, type: "input", text: trimmed },
    ]);
    sendInput(trimmed + "\n");
    setCode("");
  };

  const renderEntry = ({ item }: { item: ConsoleEntry }) => {
    const color =
      item.type === "input"
        ? "#999"
        : item.type === "error"
          ? "#E74C3C"
          : "#9ACD32";
    const prefix = item.type === "input" ? "> " : "";

    return (
      <View style={styles.entry}>
        <Typography
          type="body"
          fontType="mono"
          fontSize={13}
          color={color}
        >
          {prefix}{item.text}
        </Typography>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {status === "connecting" && (
        <View style={styles.statusBar}>
          <Typography type="caption" fontSize={11}>
            Connecting…
          </Typography>
        </View>
      )}
      {status === "error" && (
        <View style={styles.statusBar}>
          <Typography type="caption" fontSize={11} color="#E74C3C">
            Connection failed
          </Typography>
        </View>
      )}
      <FlatList
        ref={listRef}
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        style={styles.listContainer}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
        <View style={[styles.glassContainer, { marginBottom: keyboardVisible ? bottom : bottom + 70 }]}>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder={status === "connected" ? "Enter Elixir code…" : "Connecting…"}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            hasShadow={false}
          editable={status === "connected"}
          iconRight={<Button
            label="Send"
            type="primary"
            size="sm"
            pill={false}
            onPress={handleSend}
            disabled={!code.trim() || status !== "connected"}
            iconRight={<SendIcon width={16} height={16} color="white" />}
          />}
          />

        </View>
    </KeyboardAvoidingView>
  );
}
