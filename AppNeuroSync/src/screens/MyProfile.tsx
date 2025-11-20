import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../../App';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';
import { useUser } from '../context/UserContext';

type ProfileScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Profile'>,
    StackNavigationProp<RootStackParamList>
>;

const SENSORY_LABELS: Record<string, string> = {
    'visual': 'Sensível à Luz',
    'audio': 'Sensível a Ruído',
    'both': 'Sensível à Luz e Ruído',
    'none': 'Sem sensibilidade específica'
};

const MyProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();

    const { theme, toggleTheme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    // --- Contexto do usuário ---
    const { user, logout } = useUser();

    // --- Estado para notificações ---
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

    // Navegar para a tela de Acessibilidade
    const handleNavigateToAccessibility = () => {
        navigation.navigate('Accessibility');
    }

    // Navegar para a tela de Ajuda e Suporte
    const handleNavigateToHelp = () => {
        navigation.navigate('Help');
    };

    // Função auxiliar para traduzir o ID
    const getSensoryLabel = (id?: string) => {
        if (!id) return 'Não definido';
        return SENSORY_LABELS[id] || id;
    };

    // Função de Logout
    const handleLogout = () => {
        Alert.alert("Sair", "Tem certeza que deseja sair da conta?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
                }
            }
        ]);
    };

    const MenuItem = ({ icon, label, onPress, isDestructive = false }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, isDestructive?: boolean }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.iconContainerDestructive]}>
                    <Ionicons
                        name={icon}
                        size={22}
                        color={isDestructive ? '#C05D5D' : currentColors.primary}
                    />
                </View>
                <Text style={[styles.menuItemText, isDestructive && styles.menuTextDestructive]}>
                    {label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={currentColors.muted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            <StatusBar
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.headerProfile}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={40} color="#FFF" />
                    </View>
                    <Text style={styles.userName}>{user?.name || "Visitante"}</Text>
                    <Text style={styles.userRole}>Colaborador</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>E-mail</Text>
                            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Perfil Sensorial</Text>
                            <Text style={styles.infoValue}>{getSensoryLabel(user?.sensoryProfile)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações</Text>

                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={theme === 'light' ? "moon-outline" : "sunny-outline"}
                                        size={22}
                                        color={currentColors.primary}
                                    />
                                </View>
                                <Text style={styles.menuItemText}>
                                    Tema {theme === 'light' ? 'Escuro' : 'Claro'}
                                </Text>
                            </View>
                            <Ionicons
                                name={theme === 'light' ? "toggle-outline" : "toggle"}
                                size={28}
                                color={currentColors.primary}
                            />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem} onPress={toggleNotifications}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={notificationsEnabled ? "notifications-outline" : "notifications-off-outline"}
                                        size={22}
                                        color={notificationsEnabled ? currentColors.primary : currentColors.muted}
                                    />
                                </View>
                                <Text style={styles.menuItemText}>Notificações</Text>
                            </View>
                            <Ionicons
                                name={notificationsEnabled ? "toggle" : "toggle-outline"}
                                size={28}
                                color={notificationsEnabled ? currentColors.primary : currentColors.muted}
                            />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <MenuItem
                            icon="accessibility-outline"
                            label="Acessibilidade"
                            onPress={handleNavigateToAccessibility}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="help-circle-outline"
                            label="Ajuda e Suporte"
                            onPress={handleNavigateToHelp}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="log-out-outline"
                            label="Sair da conta"
                            onPress={handleLogout}
                            isDestructive
                        />
                    </View>
                </View>

                <Text style={styles.versionText}>Neuro-Sync v1.0.3</Text>

            </ScrollView>

        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: string) => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: currentColors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerProfile: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: currentColors.background,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: currentColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: currentColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    userName: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: currentColors.text,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: currentColors.primary,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.muted,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: currentColors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: currentColors.border,
    },
    menuCard: {
        backgroundColor: currentColors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: currentColors.border,
        overflow: 'hidden',
    },
    infoRow: {
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: currentColors.muted,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.text,
        lineHeight: 22,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: currentColors.card,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: theme === 'light' ? '#F0F4F8' : '#2C3A42',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconContainerDestructive: {
        backgroundColor: '#FFE5E5',
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: currentColors.text,
    },
    menuTextDestructive: {
        color: theme === 'light' ? '#C05D5D' : '#E78F8F',
    },
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginLeft: 20,
        marginVertical: 8
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        marginTop: 10,
        marginBottom: 20
    }
});

export default MyProfileScreen;