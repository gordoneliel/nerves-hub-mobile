import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FirmwareScreen from "../screens/firmware/firmware-screen";
import FirmwareDetailScreen from "../screens/firmware/firmware-detail-screen";

const FirmwareStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: "minimal",
    headerTransparent: true,
  },
  screens: {
    FirmwareList: {
      screen: FirmwareScreen,
      options: {
        title: "",
      },
    },
    FirmwareDetail: {
      screen: FirmwareDetailScreen,
      options: {
        title: "",
        headerTransparent: true,
      },
    },
  },
});

export default FirmwareStack;
