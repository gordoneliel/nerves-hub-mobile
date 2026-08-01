import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FirmwareScreen from "../screens/firmware/firmware-screen";
import FirmwareDetailScreen from "../screens/firmware/firmware-detail-screen";
import { sharedStackScreenOptions } from "./screen-options";

const FirmwareStack = createNativeStackNavigator({
  screenOptions: sharedStackScreenOptions,
  screens: {
    FirmwareList: {
      screen: FirmwareScreen,
      options: {
        title: "Firmware",
      },
    },
    FirmwareDetail: {
      screen: FirmwareDetailScreen,
      options: {
        title: "",
      },
    },
  },
});

export default FirmwareStack;
