import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DevicesScreen from "../screens/devices/index/devices-screen";
import DeviceDetailScreen from "../screens/devices/show/device-detail-screen";
import PinnedDevicesScreen from "../screens/devices/pinned-devices-screen";
import DeviceSearchScreen from "../screens/devices/device-search-screen";
import DeviceConsoleScreen from "../screens/devices/device-console-screen";
import EditDeviceTagsScreen from "../screens/devices/edit-device-tags-screen";
import NewDeviceScreen from "../screens/devices/new";
import DeviceCertificatesScreen from "../screens/devices/show/device-certificates-screen";
import DeviceFiltersScreen from "../features/device-filters/device-filters-screen";
import { DeviceListControlsProvider } from "../features/device-filters/device-list-controls";
import { sharedStackScreenOptions } from "./screen-options";

const DevicesStack = createNativeStackNavigator({
  screenOptions: sharedStackScreenOptions,
  layout: ({ children }) => (
    <DeviceListControlsProvider>{children}</DeviceListControlsProvider>
  ),
  screens: {
    DevicesList: {
      screen: DevicesScreen,
      options: {
        title: "Devices",
      },
    },
    DeviceDetail: {
      screen: DeviceDetailScreen,
      options: {
        title: "",
      },
    },
    PinnedDevices: {
      screen: PinnedDevicesScreen,
      options: {
        title: "",
      },
    },
    DeviceSearch: {
      screen: DeviceSearchScreen,
      options: {
        title: "Search",
      },
    },
    DeviceConsole: {
      screen: DeviceConsoleScreen,
      options: {
        title: "",
      },
    },
    DeviceCertificates: {
      screen: DeviceCertificatesScreen,
      options: {
        title: "",
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
            title: "",
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            contentStyle: { backgroundColor: "transparent" },
          },
        },
        DeviceFilters: {
          screen: DeviceFiltersScreen,
          options: {
            title: "Filter Devices",
            presentation: "pageSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 1.0],
          },
        },
      },
    },
  },
});

export default DevicesStack;
