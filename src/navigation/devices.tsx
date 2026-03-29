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
    // headerShown: false
  },
  screens: {
    DevicesList: {
      screen: DevicesScreen,
      options: {
        title: "",
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
    NewDevice: {
      screen: NewDeviceScreen,
      options: {
        title: "",
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
      },
    },
  },
});

export default DevicesStack;
