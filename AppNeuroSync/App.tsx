import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useFonts } from 'expo-font';

import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
// import HomeScreen from "./src/screens/HomeScreen";

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  // Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {

  // 4. Carregamos as fontes AQUI
  const [fontsLoaded] = useFonts({
    'Atkinson-Regular': require('./assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'Atkinson-Bold': require('./assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false
        }}>
        {/* <Stack.Screen name="Splash" component={SplashScreen} /> */}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}