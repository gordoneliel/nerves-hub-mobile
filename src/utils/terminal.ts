/**
 * Minimal terminal emulator for the device console, with ANSI color support.
 *
 * The NervesHub console is a raw PTY/IEx stream: the device sends `up` events
 * carrying raw bytes that include the device-side echo of typed input plus ANSI
 * escape sequences. IEx colorizes its output (prompts, atoms, strings, numbers,
 * results) with SGR color codes — so rather than implement a separate Elixir
 * highlighter, we parse those codes and render the colors the device already
 * sends, exactly like a real terminal.
 *
 * The buffer interprets the control codes IEx actually uses to draw its prompt
 * (carriage return, backspace, newline, line-erase, cursor fwd/back) and SGR
 * color/bold, and ignores the rest (cursor positioning, screen clears). It is
 * intentionally not a full xterm: it keeps a flat list of styled cells per line.
 */

/** Foreground: 0–15 = ANSI palette index, string = explicit hex, undefined = default. */
export type AnsiStyle = {
  fg?: number | string;
  bold?: boolean;
};

export type TerminalSegment = { text: string; style: AnsiStyle };

type Cell = { ch: string; style: AnsiStyle };

const sameStyle = (a: AnsiStyle, b: AnsiStyle): boolean =>
  a.fg === b.fg && !!a.bold === !!b.bold;

const EMPTY_STYLE: AnsiStyle = {};

export class TerminalBuffer {
  private lines: Cell[][] = [[]];
  private col = 0;
  private cur: AnsiStyle = {};
  private maxLines: number;

  constructor(maxLines = 2000) {
    this.maxLines = maxLines;
  }

  /** Feed a chunk of raw terminal output. */
  write(data: string): void {
    for (let i = 0; i < data.length; i++) {
      const ch = data[i];

      if (ch === "\x1b") {
        i = this.handleEscape(data, i);
        continue;
      }

      switch (ch) {
        case "\n":
          this.newLine();
          break;
        case "\r":
          this.col = 0;
          break;
        case "\b":
          if (this.col > 0) this.col--;
          break;
        case "\x07": // bell
          break;
        default:
          if (ch >= " ") this.putChar(ch);
          break;
      }
    }
    this.trim();
  }

  /** Lines as arrays of styled segments (adjacent same-style cells merged). */
  toLines(): TerminalSegment[][] {
    return this.lines.map((cells) => {
      const segs: TerminalSegment[] = [];
      for (const cell of cells) {
        const last = segs[segs.length - 1];
        if (last && sameStyle(last.style, cell.style)) {
          last.text += cell.ch;
        } else {
          segs.push({ text: cell.ch, style: cell.style });
        }
      }
      return segs;
    });
  }

  clear(): void {
    this.lines = [[]];
    this.col = 0;
    this.cur = {};
  }

  private putChar(ch: string): void {
    const line = this.lines[this.lines.length - 1];
    // Pad with default-styled spaces if writing past the current end.
    while (line.length < this.col) line.push({ ch: " ", style: EMPTY_STYLE });
    const cell: Cell = { ch, style: this.cur };
    if (this.col < line.length) line[this.col] = cell;
    else line.push(cell);
    this.col++;
  }

  private newLine(): void {
    this.lines.push([]);
    this.col = 0;
  }

  /**
   * Handle an escape sequence starting at `start` (the ESC byte). Returns the
   * index of the last consumed character so the caller's loop advances past it.
   */
  private handleEscape(data: string, start: number): number {
    const next = data[start + 1];

    // CSI: ESC [ ... <final byte 0x40–0x7E>
    if (next === "[") {
      let i = start + 2;
      let params = "";
      while (i < data.length) {
        const c = data[i];
        if (c >= "@" && c <= "~") {
          this.applyCsi(c, params);
          return i;
        }
        params += c;
        i++;
      }
      return data.length; // incomplete sequence — consume the rest
    }

    // OSC: ESC ] ... (BEL or ST). Skip the payload.
    if (next === "]") {
      let i = start + 2;
      while (i < data.length) {
        if (data[i] === "\x07") return i;
        if (data[i] === "\x1b" && data[i + 1] === "\\") return i + 1;
        i++;
      }
      return data.length;
    }

    // Two-byte escape (e.g. ESC =, ESC >) — skip the following byte.
    return start + 1;
  }

  private applyCsi(final: string, params: string): void {
    switch (final) {
      case "m":
        this.applySgr(params);
        break;
      case "K": {
        // Erase in line: 0/none = cursor→end, 1 = start→cursor, 2 = whole line
        const mode = params || "0";
        const line = this.lines[this.lines.length - 1];
        if (mode === "0") {
          line.length = Math.min(line.length, this.col);
        } else if (mode === "1") {
          for (let j = 0; j < this.col && j < line.length; j++) {
            line[j] = { ch: " ", style: EMPTY_STYLE };
          }
        } else if (mode === "2") {
          line.length = 0;
        }
        break;
      }
      case "C":
        this.col += Math.max(1, parseInt(params || "1", 10));
        break;
      case "D":
        this.col = Math.max(0, this.col - Math.max(1, parseInt(params || "1", 10)));
        break;
      // Cursor positioning (H/f), erase-display (J), etc. are ignored.
      default:
        break;
    }
  }

  /** Apply an SGR (Select Graphic Rendition) sequence, updating the cursor style. */
  private applySgr(params: string): void {
    const codes =
      params === "" ? [0] : params.split(";").map((n) => parseInt(n, 10) || 0);

    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) {
        this.cur = {};
      } else if (c === 1) {
        this.cur = { ...this.cur, bold: true };
      } else if (c === 22) {
        this.cur = { ...this.cur, bold: false };
      } else if (c >= 30 && c <= 37) {
        this.cur = { ...this.cur, fg: c - 30 };
      } else if (c === 39) {
        this.cur = { ...this.cur, fg: undefined };
      } else if (c >= 90 && c <= 97) {
        this.cur = { ...this.cur, fg: 8 + (c - 90) };
      } else if (c === 38) {
        // Extended foreground: 38;5;n (256-color) or 38;2;r;g;b (truecolor)
        if (codes[i + 1] === 5) {
          const n = codes[i + 2] ?? 0;
          this.cur = { ...this.cur, fg: n <= 15 ? n : xterm256ToHex(n) };
          i += 2;
        } else if (codes[i + 1] === 2) {
          this.cur = {
            ...this.cur,
            fg: rgbToHex(codes[i + 2] ?? 0, codes[i + 3] ?? 0, codes[i + 4] ?? 0),
          };
          i += 4;
        }
      }
      // Background colors (40–49, 100–107) and other attributes are ignored.
    }
  }

  private trim(): void {
    if (this.lines.length > this.maxLines) {
      this.lines.splice(0, this.lines.length - this.maxLines);
    }
  }
}

const toHex2 = (n: number): string =>
  Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;

/** Convert an xterm 256-color index (16–255) to a hex string. */
const xterm256ToHex = (n: number): string => {
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    return rgbToHex(v, v, v);
  }
  const i = n - 16;
  const levels = [0, 95, 135, 175, 215, 255];
  return rgbToHex(
    levels[Math.floor(i / 36) % 6],
    levels[Math.floor(i / 6) % 6],
    levels[i % 6],
  );
};

/**
 * 16-color ANSI palettes. IEx's default colors target a dark terminal, so on a
 * light background we substitute darker, readable variants. Index 0–7 are the
 * normal colors, 8–15 the bright variants.
 */
export const ANSI_PALETTE_DARK: string[] = [
  "#5C6370", // black (lifted so it's visible on dark)
  "#FF6E67", // red
  "#9ACD32", // green
  "#F1FA8C", // yellow
  "#6FB3FF", // blue
  "#FF79C6", // magenta
  "#8BE9FD", // cyan
  "#E6E6E6", // white
  "#6B7280", // bright black
  "#FF8A80", // bright red
  "#B6E36B", // bright green
  "#FFF59D", // bright yellow
  "#90CAF9", // bright blue
  "#FF9CDF", // bright magenta
  "#A5F3FC", // bright cyan
  "#FFFFFF", // bright white
];

export const ANSI_PALETTE_LIGHT: string[] = [
  "#374151", // black
  "#C0392B", // red
  "#166534", // green
  "#B7791F", // yellow / amber
  "#1E40AF", // blue
  "#86198F", // magenta
  "#0E7490", // cyan
  "#4B5563", // white (gray)
  "#4B5563", // bright black
  "#DC2626", // bright red
  "#15803D", // bright green
  "#A16207", // bright yellow
  "#2563EB", // bright blue
  "#A21CAF", // bright magenta
  "#0891B2", // bright cyan
  "#111827", // bright white
];

/** Resolve a segment's foreground to a hex color. */
export const resolveAnsiColor = (
  fg: number | string | undefined,
  palette: string[],
  defaultColor: string,
): string => {
  if (fg === undefined) return defaultColor;
  if (typeof fg === "string") return fg;
  return palette[fg] ?? defaultColor;
};
