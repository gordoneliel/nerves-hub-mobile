import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import FirmwareStack from "./firmware";
import DeploymentsStack from "./deployments";
import SettingsStack from "./settings";
import ScriptsStack from "./scripts";
import DevicesStack from "./devices";
import { colors } from "../theme/colors";

// ── Main tabs (native platform tabs) ─────────────────────────────

const HomeNavigator = createNativeBottomTabNavigator({
  screenOptions: {
    lazy: false,
    headerBackButtonDisplayMode: "minimal",
  },
  sidebarAdaptable: false,
  scrollEdgeAppearance: "opaque",
  translucent: true,
  headerTransparent: true,
  tabBarActiveTintColor: "#6366F1",
  tabBarInactiveTintColor: colors.gray[300],
  screens: {
    Devices: {
      screen: DevicesStack,
      options: {
        tabBarIcon: ({ focused }) => ({
          sfSymbol: focused ? "cpu.fill" : "cpu",
        }),
      },
    },
    Firmware: {
      screen: FirmwareStack,
      options: {
        tabBarIcon: ({ focused }) => ({
          sfSymbol: focused ? "shippingbox.fill" : "shippingbox",
        }),
      },
    },
    Deployments: {
      screen: DeploymentsStack,
      options: {
        tabBarIcon: ({ focused }) => ({
          sfSymbol: focused ? "paperplane.fill" : "paperplane",
        }),
      },
    },
    Scripts: {
      screen: ScriptsStack,
      options: {
        tabBarIcon: ({ focused }) => ({
          sfSymbol: focused ? "applescript.fill" : "applescript",
        }),
      },
    },
    Settings: {
      screen: SettingsStack,
      options: {
        tabBarIcon: ({ focused }) => ({
          sfSymbol: focused ? "gearshape.fill" : "gearshape",
        }),
        role: "search",
      },
    },
  },
});

export default HomeNavigator;
