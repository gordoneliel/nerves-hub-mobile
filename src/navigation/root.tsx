import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStaticNavigation } from "@react-navigation/native";
import { LoadingView } from "../components/ui";
import { useAuth, useIsSignedIn, useIsSignedOut } from "../context/AuthContext";
import {
  useHasOrgProduct,
  useNeedsOrgProduct,
} from "../context/OrgProductContext";

import OrgProductSelector from "../screens/org-product-selector";

import AuthNavigator from "./auth";
import HomeNavigator from "./home";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

const RootStack = createNativeStackNavigator({
  screenOptions: {
    // headerStyle: { backgroundColor: '#F4F5F6' },
    // headerTintColor: '#0C1202E5',
    headerShown: false,
    headerTransparent: true,
  },
  layout: ({ children }) => {
    const { isLoading } = useAuth();
    if (isLoading) return <LoadingView message="Loading…" />;
    return <>{children}</>;
  },
  screens: {
    Auth: {
      if: useIsSignedOut,
      screen: AuthNavigator,
    },
    OrgProduct: {
      if: useNeedsOrgProduct,
      screen: OrgProductSelector,
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
        presentation: isLiquidGlassSupported ? "formSheet" : "transparentModal",
        sheetExpandsWhenScrolledToEdge: true,
        sheetGrabberVisible: true,
        sheetAllowedDetents: "fitToContents",
      },
      screens: {
        OrgProductModal: {
          screen: OrgProductSelector,
          options: {
            headerShown: true,
            title: "",
          },
        },
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default Navigation;
