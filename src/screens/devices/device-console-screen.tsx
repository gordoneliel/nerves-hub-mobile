import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StaticScreenProps } from "@react-navigation/native";

import type { TextInput as RNTextInput } from "react-native";

import { Typography } from "../../components/typography";
import { Button } from "../../components/button";
import { TextInput } from "../../components/text-input";
import { SuggestionBar } from "../../components/suggestion-bar";
import {
  completeConsoleInput,
  applyCompletion,
} from "../../utils/consoleCompletions";
import { useConsoleChannel } from "../../hooks/useConsoleChannel";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { useTheme } from "../../theme/ThemeProvider";
import type { ColorTheme } from "../../theme/colors";
import type { Spacing } from "../../theme/spacing";
import {
  TerminalBuffer,
  type TerminalSegment,
  ANSI_PALETTE_DARK,
  ANSI_PALETTE_LIGHT,
  resolveAnsiColor,
} from "../../utils/terminal";
import SendIcon from "../../../assets/icons/send.svg";

type Props = StaticScreenProps<{ identifier: string }>;

// Approximate monospace metrics for the 13px terminal font, used to tell the
// device PTY how to size its output (the `window_size` event).
const CHAR_WIDTH = 7.8;
const LINE_HEIGHT = 18;

const createStyles = (colors: ColorTheme, spacing: Spacing) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Shrinks with the keyboard (via KeyboardAvoidingView padding); the absolute
  // bottom bar is anchored to it, so it always floats just above the keyboard.
  inner: {
    flex: 1,
  },
  output: {
    flex: 1,
  },
  outputContent: {
    paddingTop: 120,
    paddingHorizontal: spacing[18],
  },
  // Overlays the bottom of the output so terminal text can scroll underneath
  // the (translucent) input. Anchored to the bottom of `inner`.
  bottomBar: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing[6],
    paddingHorizontal: spacing[18],
    paddingVertical: spacing[6],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  glassContainer: {
    height: 64,
    marginHorizontal: spacing[18],
  },
  input: {
    flex: 1,
    borderWidth: 0,
  },
});

export default function DeviceConsoleScreen({ route }: Props) {
  const { identifier } = route.params;
  const styles = useThemedStyles(createStyles);
  const { isDark } = useTheme();
  // Lime green reads well on the dark terminal but washes out on a light
  // background, so use a deep forest green in light mode.
  const terminalColor = isDark ? "#9ACD32" : "#166534";
  const { bottom } = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [code, setCode] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  // Measured height of the bottom bar (suggestions + input + safe-area inset),
  // used as the output's bottom padding so the last line clears the input.
  const [bottomBarHeight, setBottomBarHeight] = useState(130);
  const [output, setOutput] = useState<TerminalSegment[][]>([]);
  const ansiPalette = isDark ? ANSI_PALETTE_DARK : ANSI_PALETTE_LIGHT;

  const terminalRef = useRef(new TerminalBuffer());
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Command suggestions for the token currently being typed.
  const suggestions = useMemo(
    () => (inputFocused ? completeConsoleInput(code) : []),
    [code, inputFocused],
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setCode((prev) => applyCompletion(prev, suggestion));
      inputRef.current?.focus();
    },
    [],
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Coalesce bursts of `up` events into a single state update per frame so a
  // chatty device doesn't trigger a render per chunk.
  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      setOutput(terminalRef.current.toLines());
    }, 16);
  }, []);

  const onOutput = useCallback(
    (data: string) => {
      terminalRef.current.write(data);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  useEffect(() => {
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, []);

  const { status, sendInput, sendWindowSize } = useConsoleChannel({
    identifier,
    onOutput,
  });

  // Tell the device how large our "terminal" is once connected.
  useEffect(() => {
    if (status !== "connected") return;
    const { width, height } = Dimensions.get("window");
    const cols = Math.max(20, Math.floor((width - 36) / CHAR_WIDTH));
    const rows = Math.max(10, Math.floor((height - 240) / LINE_HEIGHT));
    sendWindowSize(rows, cols);
  }, [status, sendWindowSize]);

  const handleSend = () => {
    if (status !== "connected") return;
    // Send the line plus a carriage return — that's what a terminal emits on
    // Enter. The device PTY echoes the input back via `up`, so we don't render
    // it locally (doing so would double up the text).
    sendInput(code + "\r");
    setCode("");
  };

  const statusColor =
    status === "connected"
      ? terminalColor
      : status === "error"
        ? "#E74C3C"
        : "#E0E3E6";

  const statusLabel = useMemo(() => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      case "error":
        return "Connection failed";
      default:
        return "Disconnected";
    }
  }, [status]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.inner}>
      <ScrollView
        ref={scrollRef}
        style={styles.output}
        StickyHeaderComponent={() => (
          <View style={styles.statusBar}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Typography type="caption" fontSize={11} color={statusColor}>
              {statusLabel}
            </Typography>
          </View>
        )}
        contentContainerStyle={[
          styles.outputContent,
          { paddingBottom: bottomBarHeight + 12 },
        ]}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {output.map((segments, lineIndex) => (
          <Typography
            key={lineIndex}
            type="body"
            fontType="mono"
            fontSize={13}
            color={terminalColor}
          >
            {segments.length === 0
              ? " "
              : segments.map((segment, segIndex) => (
                  <Typography
                    key={segIndex}
                    type="body"
                    fontType="mono"
                    fontSize={13}
                    fontWeight={segment.style.bold ? "700" : undefined}
                    color={resolveAnsiColor(
                      segment.style.fg,
                      ansiPalette,
                      terminalColor,
                    )}
                  >
                    {segment.text}
                  </Typography>
                ))}
          </Typography>
        ))}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: keyboardVisible ? 8 : bottom + 70 },
        ]}
        onLayout={(e) => setBottomBarHeight(e.nativeEvent.layout.height)}
      >
        <SuggestionBar
          suggestions={suggestions}
          onSelect={handleSelectSuggestion}
        />

        <View style={styles.glassContainer}>
          <TextInput
            ref={inputRef}
          value={code}
          onChangeText={setCode}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={
            status === "connected" ? "Enter Elixir code…" : "Connecting…"
          }
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          hasShadow={false}
          editable={status === "connected"}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
          iconRight={
            <Button
              label="Send"
              type="primary"
              size="sm"
              pill={false}
              onPress={handleSend}
              disabled={status !== "connected"}
              iconRight={<SendIcon width={16} height={16} color="white" />}
            />
          }
          />
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}
