import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

// --- MOCK DE DADOS ---
const USER_NAME = "Maria Silva"; 
const mockSalas = [
  { id: '1', nome: 'Sala Zen 1A', ruido: 'CALMO', luz: 'BAIXA', reservada: false, local: 'Andar 1' },
  { id: '2', nome: 'Sala Foco B', ruido: 'MODERADO', luz: 'ALTA', reservada: false, local: 'Andar 2' },
  { id: '3', nome: 'Cabine Silêncio 3', ruido: 'MÁXIMO', luz: 'MÉDIA', reservada: true, local: 'Térreo' }, 
  { id: '4', nome: 'Sala Terapia C', ruido: 'CALMO', luz: 'MÉDIA', reservada: false, local: 'Andar 3' },
];

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const getStatusColor = (statusValue: string, theme: 'light' | 'dark') => {
    switch (statusValue) {
        case 'CALMO':
        case 'BAIXA':
            return { 
                bg: theme === 'light' ? '#E3F0EA' : '#1F332A', 
                text: theme === 'light' ? '#2D6A4F' : '#81B29A',
                icon: 'leaf-outline' 
            };
        case 'MODERADO':
        case 'MÉDIA':
            return { 
                bg: theme === 'light' ? '#F4F1EA' : '#3D3828', 
                text: theme === 'light' ? '#9C8228' : '#E0C870',
                icon: 'git-commit-outline'
            };
        case 'ALTA':
        case 'MÁXIMO':
            return { 
                bg: theme === 'light' ? '#F9EBEB' : '#3E2525', 
                text: theme === 'light' ? '#C05D5D' : '#E78F8F',
                icon: 'alert-circle-outline'
            };
        default:
            return { 
                bg: theme === 'light' ? '#F0F2F5' : '#2A2E33', 
                text: theme === 'light' ? '#6B7280' : '#9CA3AF',
                icon: 'help-circle-outline'
            };
    }
};

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {

    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    const [salas, setSalas] = useState(mockSalas);
    const availableRoomsCount = salas.filter(s => !s.reservada).length;

    const handleNavigateToDetails = (salaId: string, nome: string) => {
        Alert.alert("Sala Selecionada", `Você tocou em: ${nome}`);
    };

    const renderItem = ({ item }: { item: typeof mockSalas[0] }) => {
        const ruidoInfo = getStatusColor(item.ruido, theme);
        const luzInfo = getStatusColor(item.luz, theme);
        const isReserved = item.reservada;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isReserved ? styles.cardReserved : styles.cardAvailable 
                ]}
                onPress={() => handleNavigateToDetails(item.id, item.nome)}
                disabled={isReserved}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isReserved && styles.textReserved]}>
                        {item.nome}
                    </Text>
                    {isReserved && (
                        <View style={styles.reservedBadge}>
                            <Ionicons name="lock-closed" size={12} color="#FFF" />
                            <Text style={styles.reservedText}>Ocupada</Text>
                        </View>
                    )}
                </View>
                
                <Text style={styles.cardLocal}>{item.local}</Text>
                
                <View style={styles.divider} />

                <View style={styles.statusContainer}>
                    {/* Tag de Ruído */}
                    <View style={[styles.statusTag, { backgroundColor: isReserved ? currentColors.border : ruidoInfo.bg }]}>
                        <Ionicons 
                            name={isReserved ? "mic-off-outline" : ruidoInfo.icon as any} 
                            size={16} 
                            color={isReserved ? currentColors.muted : ruidoInfo.text} 
                        />
                        <Text style={[styles.statusText, { color: isReserved ? currentColors.muted : ruidoInfo.text }]}>
                             {item.ruido}
                        </Text>
                    </View>

                    {/* Tag de Luz */}
                    <View style={[styles.statusTag, { backgroundColor: isReserved ? currentColors.border : luzInfo.bg }]}>
                        <Ionicons 
                            name={isReserved ? "eye-off-outline" : "sunny-outline"} 
                            size={16} 
                            color={isReserved ? currentColors.muted : luzInfo.text} 
                        />
                        <Text style={[styles.statusText, { color: isReserved ? currentColors.muted : luzInfo.text }]}>
                             {item.luz}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeContainer}>
            <StatusBar 
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Olá, {USER_NAME.split(' ')[0]}!</Text>
                    <Text style={styles.headerTitle}>Espaços Calmos</Text>
                </View>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => Alert.alert("Filtros Sensoriais", "Ajustar preferência de luz e ruído.")}
                        accessibilityLabel="Filtrar salas"
                    >
                        <Ionicons name="filter" size={22} color={currentColors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={salas}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.listHeaderContainer}>
                        <Text style={styles.listHeaderTitle}>
                            {availableRoomsCount} Salas Disponíveis
                        </Text>
                        <Text style={styles.listHeaderSubtitle}>
                            Escolha um ambiente adequado para você:
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark') => StyleSheet.create({
    safeContainer: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: currentColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: currentColors.background,
    },
    headerSubtitle: {
        fontSize: 15,
        color: currentColors.muted,
        fontFamily: 'Atkinson-Regular',
        marginBottom: 6,
    },
    headerTitle: {
        fontSize: 26, 
        color: currentColors.text,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 12,
        backgroundColor: currentColors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: currentColors.border,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    listHeaderContainer: {
        marginBottom: 24,
    },
    listHeaderTitle: {
        fontSize: 18,
        color: currentColors.text,
        fontFamily: 'Inter-SemiBold',
    },
    listHeaderSubtitle: {
        fontSize: 15,
        color: currentColors.muted,
        fontFamily: 'Atkinson-Regular',
        marginTop: 6,
        lineHeight: 22,
    },
    card: {
        backgroundColor: currentColors.card,
        borderRadius: 20,
        marginBottom: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: theme === 'light' ? '#64748B' : '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme === 'light' ? 0.08 : 0.2, 
        shadowRadius: 10,
        elevation: 2,
    },
    cardAvailable: {
        borderColor: currentColors.border,
    },
    cardReserved: {
        backgroundColor: theme === 'light' ? '#F8FAFC' : '#16181D',
        borderColor: currentColors.border,
        opacity: 0.6,
    },
    textReserved: {
        color: currentColors.muted,
        textDecorationLine: 'line-through',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 19,
        color: currentColors.text,
        fontFamily: 'Inter-SemiBold',
        flex: 1,
        marginRight: 10,
    },
    cardLocal: {
        fontSize: 15,
        color: currentColors.muted,
        fontFamily: 'Atkinson-Regular',
        marginBottom: 16,
    },
    reservedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: currentColors.muted,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    reservedText: {
        color: '#FFF',
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        textTransform: 'uppercase',
    },
    
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginBottom: 16,
        opacity: 0.4,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 8,
    },
    statusText: {
        fontSize: 13, 
        fontFamily: 'Inter-Medium',
        letterSpacing: 0.2,
    },
});

export default HomeScreen;