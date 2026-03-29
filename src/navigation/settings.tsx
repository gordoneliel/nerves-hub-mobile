import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/settings-screen";
import OrgUsersScreen from "../screens/settings/org-users-screen";
import CACertificatesScreen from "../screens/settings/ca-certificates-screen";

const SettingsStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: "minimal",
    headerTransparent: true,
  },
  screens: {
    SettingsMain: {
      screen: SettingsScreen,
      options: {
        title: "",
      },
    },
    OrgUsers: {
      screen: OrgUsersScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
    CACertificates: {
      screen: CACertificatesScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
  },
});

export default SettingsStack;
