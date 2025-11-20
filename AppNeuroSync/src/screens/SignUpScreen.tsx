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
    StatusBar,
    ScrollView
} from 'react-native';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootStackParamList } from '../../App';
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';
import { useUser } from '../context/UserContext';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, "SignUp">;

interface Props {
    navigation: SignUpScreenNavigationProp;
}

// --- MOCK DE PERFIS SENSORIAIS ---
const SENSORY_PROFILES = [
    { id: 'visual', label: 'Sensível à Luz', icon: 'eye-off-outline' },
    { id: 'audio', label: 'Sensível a Ruído', icon: 'volume-mute-outline' },
    { id: 'both', label: 'Ambos', icon: 'options-outline' },
    { id: 'none', label: 'Nenhum', icon: 'happy-outline' },
];

const SignUpScreen: React.FC<Props> = ({ navigation }) => {

    const { theme, toggleTheme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors);

    // --- Estados dos campos do formulário ---
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmeSenha, setConfirmeSenha] = useState('');
    const [sensoryProfile, setSensoryProfile] = useState<string | null>(null);

    // --- Contexto de Usuário ---
    const { register } = useUser();

    // Validação para os inputs de cadastro
    const handleRegister = async () => {
        if (!nome || !email || !senha || !confirmeSenha) {
            Toast.show({
                type: 'error',
                text1: 'Campos incompletos',
                text2: 'Por favor, preencha todos os dados!',
            });
            return;
        }
        if (senha !== confirmeSenha) {
            Toast.show({
                type: 'error',
                text1: 'Atenção',
                text2: 'As senhas digitadas não conferem!',
            });
            return;
        }
        if (!sensoryProfile) {
            Toast.show({
                type: 'info',
                text1: 'Perfil Sensorial',
                text2: 'Selecione uma opção para personalizarmos o app!',
            });
            return;
        }

        try {
            await register({
                name: nome,
                email: email,
                sensoryProfile: sensoryProfile
            });
            Toast.show({
                type: 'success',
                text1: 'Bem-vindo(a)!',
                text2: 'Sua conta foi criada com sucesso!',
            });
            navigation.navigate('MainTabs');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro no cadastro',
                text2: 'Não foi possível criar a conta. Tente novamente',
            });
        }
    };

    const handleNavigateToLogin = () => {
        navigation.navigate('SignIn');
    };

    return (
        <KeyboardAwareScrollView
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

                    <View style={styles.divider} />

                    <Text style={styles.label}>Perfil Sensorial</Text>
                    <Text style={styles.subLabel}>Isso ajuda a recomendar salas ideais.</Text>

                    <View style={styles.optionsRow}>
                        {SENSORY_PROFILES.map((profile) => {
                            const isSelected = sensoryProfile === profile.id;
                            return (
                                <TouchableOpacity
                                    key={profile.id}
                                    style={[
                                        styles.optionCard,
                                        isSelected && styles.optionCardSelected
                                    ]}
                                    onPress={() => setSensoryProfile(profile.id)}
                                >
                                    <Ionicons
                                        name={profile.icon as any}
                                        size={24}
                                        color={isSelected ? currentColors.background : currentColors.text}
                                    />
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected
                                    ]}>
                                        {profile.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={handleNavigateToLogin}
                    >
                        <Text style={styles.linkText}>Já tem uma conta? Faça o login aqui</Text>
                    </TouchableOpacity>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    );
};

const getStyles = (currentColors: ThemeColors) => StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingTop: StatusBar.currentHeight,
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
    sensoryContainer: {
        width: '100%',
        marginBottom: 25,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 14,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 24,
        paddingBottom: 15,
    },
    optionCard: {
        width: '48%',
        backgroundColor: currentColors.card,
        borderWidth: 1,
        borderColor: currentColors.border,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionCardSelected: {
        backgroundColor: currentColors.primary,
        borderColor: currentColors.primary,
    },
    optionText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: currentColors.text,
        textAlign: 'center',
    },
    optionTextSelected: {
        color: currentColors.background,
    },
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginLeft: 20,
        marginVertical: 8,
        borderColor: currentColors.border,
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
        paddingBottom: 50,
    },
});

export default SignUpScreen;