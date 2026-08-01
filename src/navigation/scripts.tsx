import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScriptsScreen from "../screens/scripts-screen";
import RunScriptScreen from "../screens/run-script-screen";
import ScriptEditorScreen from "../screens/script-editor-screen";
import { sharedStackScreenOptions } from "./screen-options";

const ScriptsStack = createNativeStackNavigator({
  screenOptions: sharedStackScreenOptions,
  screens: {
    ScriptsList: {
      screen: ScriptsScreen,
      options: {
        title: "Scripts",
      },
    },
    RunScript: {
      screen: RunScriptScreen,
      options: {
        title: "Run Script",
      },
    },
    ScriptEditor: {
      screen: ScriptEditorScreen,
      options: { title: "Script" },
    },
  },
});

export default ScriptsStack;
