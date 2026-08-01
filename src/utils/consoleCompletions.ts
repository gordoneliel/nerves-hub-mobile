/**
 * Client-side command autocompletion for the device console.
 *
 * The console is line-buffered locally (the partial line never reaches IEx
 * until Send), so IEx's own Tab completion can't be used. Instead we offer a
 * curated vocabulary of the IEx helpers, Toolshed commands, and Nerves calls
 * that are actually typed on a device console, matched against the token the
 * user is currently typing.
 */
export const CONSOLE_COMMANDS: string[] = [
  // IEx helpers
  "clear",
  "recompile",
  "runtime_info()",
  "exit()",
  // Toolshed (https://hexdocs.pm/toolshed)
  "cmd(",
  "uptime()",
  "date()",
  "dmesg()",
  "ifconfig()",
  "ping(",
  "top()",
  "tree()",
  "hostname()",
  "lsmod()",
  "lsusb()",
  "free()",
  "memory()",
  "nslookup(",
  "history()",
  "uname()",
  "weather()",
  // Nerves runtime
  "Nerves.Runtime.reboot()",
  "Nerves.Runtime.revert()",
  "Nerves.Runtime.validate_firmware()",
  "Nerves.Runtime.serial_number()",
  "Nerves.Runtime.KV.get_all()",
  // NervesHub / link
  "NervesHubLink.reconnect()",
  "NervesHubLink.connected?()",
  // Logging / network
  "RingLogger.next()",
  "RingLogger.attach()",
  "RingLogger.detach()",
  "RingLogger.tail()",
  "RingLogger.grep(",
  "VintageNet.info()",
  "VintageNet.get_configuration(",
  // Elixir / OTP common
  "Application.started_applications()",
  "Application.loaded_applications()",
  "System.version()",
  "System.cmd(",
  "System.get_env(",
  "Process.list()",
  "IO.inspect(",
  "Logger.info(",
];

// The trailing token being typed: identifier chars plus `.`, `!`, `?` so that
// module paths (`Nerves.Runtime`) and bang/predicate names complete too.
const TOKEN_RE = /[A-Za-z0-9_.!?]*$/;

/** The token currently being typed at the end of `input`. */
export function currentToken(input: string): string {
  return input.match(TOKEN_RE)?.[0] ?? "";
}

/**
 * Suggestions for the current input. With no token typed, returns a starter
 * set for discoverability; otherwise prefix-matches the trailing token.
 */
export function completeConsoleInput(input: string, max = 12): string[] {
  const token = currentToken(input);
  if (!token) {
    return input === "" ? CONSOLE_COMMANDS.slice(0, max) : [];
  }
  const lower = token.toLowerCase();
  return CONSOLE_COMMANDS.filter(
    (c) => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower,
  ).slice(0, max);
}

/** Replace the trailing token of `input` with `completion`. */
export function applyCompletion(input: string, completion: string): string {
  return input.replace(TOKEN_RE, completion);
}
