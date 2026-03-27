import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeploymentsScreen from "../screens/deployments/deployments-screen";
import DeploymentDetailScreen from "../screens/deployments/deployment-detail-screen";
import NewDeploymentScreen from "../screens/deployments/new-deployment-screen";

const DeploymentsStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: "minimal",
    headerTransparent: true,
  },
  screens: {
    DeploymentsList: {
      screen: DeploymentsScreen,
      options: {
        title: "",
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
          },
        },
      },
    },
  },
});

export default DeploymentsStack;
