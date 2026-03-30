import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScriptsScreen from "../screens/scripts-screen";
import RunScriptScreen from "../screens/run-script-screen";

const ScriptsStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: "minimal",
    headerTransparent: true,
    headerLargeTitle: true,
    headerLargeTitleStyle: {
      fontFamily: "PlusJakartaSans-VariableFont_wght",
      fontSize: 26,
      fontWeight: "600",
    },
  },
  screens: {
    ScriptsList: {
      screen: ScriptsScreen,
      options: {
        title: "",
      },
    },
    RunScript: {
      screen: RunScriptScreen,
      options: {
        title: "Run Script",
      },
    },
  },
});

export default ScriptsStack;
