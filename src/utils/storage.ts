import { MMKV } from "react-native-mmkv";

export const STORAGE_KEYS = {
  INSTANCE_URL: "instanceUrl",
  INSTANCE_URLS: "nervesHubInstanceUrls",
  ORG: "org",
  PRODUCT: "product",
  THEME: "theme",
} as const;

class Storage {
  private mmkv = new MMKV();

  getString(key: string): string | undefined {
    return this.mmkv.getString(key);
  }

  setString(key: string, value: string): void {
    this.mmkv.set(key, value);
  }

  getArray<T = string>(key: string): T[] {
    const raw = this.mmkv.getString(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  }

  addItem<T = string>(key: string, item: T): void {
    const arr = this.getArray<T>(key);
    if (!arr.includes(item)) {
      arr.push(item);
      this.mmkv.set(key, JSON.stringify(arr));
    }
  }

  remove(key: string): void {
    this.mmkv.delete(key);
  }
}

export const storage = new Storage();
