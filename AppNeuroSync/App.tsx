import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Importando o contexto de tema
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { colors } from './src/theme/colors';
import { useFonts } from 'expo-font';

// Importando as telas
import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MyProfileScreen from "./src/screens/MyProfile";
import ReservationsScreen from "./src/screens/ReservationsScreen";

export type MainTabParamList = {
  Home: undefined;
  Reservations: undefined;
  Profile: undefined;
  SignIn: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {

  const { theme } = useTheme();
  const currentColors = colors[theme];

  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    backgroundColor: currentColors.card,
    borderTopColor: currentColors.border,
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom + 5,
    paddingTop: 5,
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: currentColors.muted,

        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} options={{ title: 'Reservas' }} />
      <Tab.Screen name="Profile" component={MyProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

const AppContent = () => {

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
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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