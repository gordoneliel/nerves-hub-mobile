import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DevicesScreen from "../screens/devices/index/devices-screen";
import DeviceDetailScreen from "../screens/devices/show/device-detail-screen";
import PinnedDevicesScreen from "../screens/devices/pinned-devices-screen";
import DeviceSearchScreen from "../screens/devices/device-search-screen";
import DeviceConsoleScreen from "../screens/devices/device-console-screen";
import EditDeviceTagsScreen from "../screens/devices/edit-device-tags-screen";
import NewDeviceScreen from "../screens/devices/new";
import DeviceCertificatesScreen from "../screens/devices/show/device-certificates-screen";

const DevicesStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: "minimal",
    headerTransparent: true,
    headerLargeTitle: true,
    headerLargeTitleEnabled: true,
    headerLargeTitleStyle: {
      fontFamily: "PlusJakartaSans-VariableFont_wght",
      fontSize: 26,
      fontWeight: "600",
    },
  },
  screens: {
    DevicesList: {
      screen: DevicesScreen,
      options: {
        title: "Devices",
        // headerTitle: "Devices",
      },
    },
    DeviceDetail: {
      screen: DeviceDetailScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
    PinnedDevices: {
      screen: PinnedDevicesScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
    DeviceSearch: {
      screen: DeviceSearchScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
    DeviceConsole: {
      screen: DeviceConsoleScreen,
      options: {
        title: "Console",
        headerTransparent: true,
      },
    },
    DeviceCertificates: {
      screen: DeviceCertificatesScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
  },
  groups: {
    Modal: {
      screenOptions: {
        presentation: "pageSheet",
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.5, 1.0],
      },
      screens: {
        EditDeviceTags: {
          screen: EditDeviceTagsScreen,
          options: {
            title: "",
          },
        },
        NewDevice: {
          screen: NewDeviceScreen,
          options: {
            title: "New Device",
            presentation: "pageSheet",
            sheetAllowedDetents: [0.8, 1.0],
          },
        },
      },
    },
  },
});

export default DevicesStack;
