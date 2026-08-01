import { rm } from "node:fs/promises";

const generated = new URL("../src/api/generated", import.meta.url);
await rm(generated, { recursive: true, force: true });
