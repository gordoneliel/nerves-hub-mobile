export const ARCHITECTURES = [
  "aarch64",
  "arm",
  "mipsel",
  "riscv32",
  "riscv64",
  "x86_64",
  "x86",
] as const;

export type Architecture = (typeof ARCHITECTURES)[number];
