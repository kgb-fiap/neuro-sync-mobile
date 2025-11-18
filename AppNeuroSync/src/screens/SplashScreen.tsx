import React from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useFonts } from 'expo-font';


import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

const SplashScreen: React.FC = () => {

  const { theme } = useTheme();
  const currentColors = colors[theme];
  const styles = getStyles(currentColors);

  const [fontsLoaded] = useFonts({
    'Atkinson-Regular': require('../../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'Atkinson-Bold': require('../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
    'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/neuro-sync-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Neuro-Sync</Text>

      <ActivityIndicator 
        size="large" 
        color={currentColors.primary}
        style={styles.spinner} 
      />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
};

const getStyles = (currentColors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentColors.background,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: currentColors.text,
    marginBottom: 40,
    fontFamily: 'Inter-SemiBold',
  },
  spinner: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: currentColors.primary,
    fontFamily: 'Inter-Regular',
  }
});

export default SplashScreen;