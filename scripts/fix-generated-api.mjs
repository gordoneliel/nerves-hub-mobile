import { readdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../src/api/generated", import.meta.url);

const normalize = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(entry.name, `${directory.href}/`);
    if (entry.isDirectory()) {
      await normalize(path);
    } else if (entry.name.endsWith(".ts")) {
      const source = await readFile(path, "utf8");
      await writeFile(path, `${source.trimEnd()}\n`);
    }
  }
};

await normalize(root);
