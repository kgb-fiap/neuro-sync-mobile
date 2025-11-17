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

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, "SignUp">;

interface Props {
    navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {

    const { theme, toggleTheme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmeSenha, setConfirmeSenha] = useState('');

    const handleRegister = () => {
        if (!nome || !email || !senha || !confirmeSenha) {
            Alert.alert('Campos vazios', 'Por favor, preencha todos os campos.');
            return;
        }
        if (senha !== confirmeSenha) {
            Alert.alert('Senhas não conferem', 'As senhas digitadas são diferentes.');
            return;
        }
        
        console.log('Cadastro simulado com:', nome, email);
        // Navega para Home (assumindo auto-login)
        // navigation.navigate('Home'); 
    };

    const handleNavigateToLogin = () => {
        navigation.navigate('SignIn');
    };

    return (
        <KeyboardAwareScrollView
            // Estilo do container do KASV
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    <Text style={styles.title}>Criar Conta</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nome"
                        placeholderTextColor={currentColors.muted}
                        autoCapitalize="words"
                        value={nome}
                        onChangeText={setNome}
                    />
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
                    <TextInput
                        style={styles.input}
                        placeholder="Confirme a senha"
                        placeholderTextColor={currentColors.muted}
                        secureTextEntry
                        value={confirmeSenha}
                        onChangeText={setConfirmeSenha}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={handleNavigateToLogin}
                    >
                        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
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
        fontWeight: 'bold',
        color: currentColors.text,
        marginBottom: 40,
        fontFamily: 'Inter-SemiBold',
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

export default SignUpScreen;