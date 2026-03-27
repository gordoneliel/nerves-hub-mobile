import * as Keychain from "react-native-keychain";

const SERVICE_NAME = "nerveshub";

export async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    service: SERVICE_NAME,
  });
  return credentials ? credentials.password : null;
}

export async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword("token", token, {
    service: SERVICE_NAME,
  });
}

export async function deleteToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE_NAME });
}
