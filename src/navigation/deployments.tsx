import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeploymentsScreen from "../screens/deployments/deployments-screen";
import DeploymentDetailScreen from "../screens/deployments/deployment-detail-screen";
import NewDeploymentScreen from "../screens/deployments/new-deployment-screen";

const DeploymentsStack = createNativeStackNavigator({
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
    DeploymentsList: {
      screen: DeploymentsScreen,
      options: {
        title: "Deployments",
      },
    },
    DeploymentDetail: {
      screen: DeploymentDetailScreen,
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
        sheetAllowedDetents: [0.75, 1.0],
      },
      screens: {
        NewDeployment: {
          screen: NewDeploymentScreen,
          options: {
            title: "",
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            contentStyle: { backgroundColor: "transparent" },
          },
        },
      },
    },
  },
});

export default DeploymentsStack;
