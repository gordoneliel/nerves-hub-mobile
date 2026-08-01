import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/settings-screen";
import OrgUsersScreen from "../screens/settings/org-users-screen";
import CACertificatesScreen from "../screens/settings/ca-certificates-screen";
import SigningKeysScreen from "../screens/settings/signing-keys-screen";
import AppearanceScreen from "../screens/settings/appearance-screen";
import { sharedStackScreenOptions } from "./screen-options";

const SettingsStack = createNativeStackNavigator({
  screenOptions: sharedStackScreenOptions,
  screens: {
    SettingsMain: {
      screen: SettingsScreen,
      options: {
        title: "Settings",
      },
    },
    OrgUsers: {
      screen: OrgUsersScreen,
      options: {
        title: "Organization Users",
      },
    },
    CACertificates: {
      screen: CACertificatesScreen,
      options: {
        title: "CA Certificates",
      },
    },
    SigningKeys: {
      screen: SigningKeysScreen,
      options: {
        title: "Signing Keys",
      },
    },
    Appearance: {
      screen: AppearanceScreen,
      options: {
        title: "Appearance",
      },
    },
  },
});

export default SettingsStack;
