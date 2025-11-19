import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootStackParamList } from '../../App';
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, "SignIn">;

interface Props {
    navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const { theme, toggleTheme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors);

    const handleLogin = () => {
        if (email === '' || senha === '') {
            Alert.alert('Campos vazios', 'Por favor, preencha o email e a senha.');
            return;
        }
        // console.log('Login simulado com:', email);
        navigation.navigate('MainTabs'); 
    };

    const handleNavigateToRegister = () => {
        navigation.navigate('SignUp');
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid
            showsVerticalScrollIndicator={false}
        >
            <StatusBar 
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>

                    <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                        <Ionicons
                            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
                            size={24}
                            color={currentColors.primary}
                        />
                    </TouchableOpacity>

                    <Image
                        source={require('../../assets/images/neuro-sync-logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Neuro-Sync</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={currentColors.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor={currentColors.muted}
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkButton}>
                        <Text style={styles.linkText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={handleNavigateToRegister}
                    >
                        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se aqui</Text>
                    </TouchableOpacity>
                </View>

            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    );
};

const getStyles = (currentColors: ThemeColors) => StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: currentColors.background,
        paddingTop: 60,
        paddingBottom: 40,
    },
    themeButton: {
        position: 'absolute',
        top: 60,
        right: 25,
        padding: 8,
        backgroundColor: currentColors.card,
        borderColor: currentColors.border,
        borderWidth: 1,
        borderRadius: 50,
        elevation: 2,
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        color: currentColors.text,
        marginBottom: 40,
        fontFamily: 'Atkinson-Bold',
    },
    input: {
        width: '85%',
        height: 55,
        backgroundColor: currentColors.card,
        borderRadius: 10,
        paddingLeft: 20,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: currentColors.border,
        color: currentColors.text,
        fontFamily: 'Atkinson-Regular', 
    },
    button: {
        width: '85%',
        height: 55,
        backgroundColor: currentColors.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: currentColors.background,
        fontSize: 18,
        fontFamily: 'Inter-Medium',
    },
    linkButton: {
        marginTop: 20,
    },
    linkText: {
        color: currentColors.primary,
        fontSize: 14,
        fontFamily: 'Inter-Regular', 
    },
});

export default SignInScreen;