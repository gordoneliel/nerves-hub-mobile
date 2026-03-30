import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStaticNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { useAuth, useIsSignedIn, useIsSignedOut } from "../context/AuthContext";
import {
  useHasOrgProduct,
  useNeedsOrgProduct,
} from "../context/OrgProductContext";

import OrgProductSelector from "../screens/org-product-selector";
import OnboardingProductSelector from "../screens/onboarding-product-selector";

import AuthNavigator from "./auth";
import HomeNavigator from "./home";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
    headerTransparent: true,
  },
  layout: ({ children }) => {
    const { ready } = useAuth();
    if (!ready) return <View />;
    return <>{children}</>;
  },
  screens: {
    Auth: {
      if: useIsSignedOut,
      screen: AuthNavigator,
    },
    OrgProduct: {
      if: useNeedsOrgProduct,
      screen: OnboardingProductSelector,
    },
    Home: {
      if: useIsSignedIn,
      screen: HomeNavigator,
      options: {
        headerShown: false,
      },
    },
  },
  groups: {
    Modal: {
      screenOptions: {
        presentation: isLiquidGlassSupported ? "pageSheet" : "transparentModal",
        sheetExpandsWhenScrolledToEdge: true,
        sheetGrabberVisible: true,
        sheetAllowedDetents: [0.5, 1.0],
      },
      screens: {
        OrgProductModal: {
          screen: OrgProductSelector,
          options: {
            headerShown: true,
            title: "Switch Product",
            headerLargeTitle: true,
            headerLargeTitleStyle: {
              fontFamily: "PlusJakartaSans-VariableFont_wght",
              fontSize: 26,
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default Navigation;
