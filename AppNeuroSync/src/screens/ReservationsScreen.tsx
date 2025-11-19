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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../../App';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

// --- MOCK DE DADOS DE RESERVAS ---
const initialReservations = [
  { id: '1', roomName: 'Sala Zen 1A', date: '19 Nov, 2025', time: '14:00 - 15:00', status: 'active' },
  { id: '2', roomName: 'Sala Foco B', date: '20 Nov, 2025', time: '09:00 - 11:00', status: 'active' },
  { id: '3', roomName: 'Cabine Silêncio 3', date: '15 Nov, 2025', time: '10:00 - 10:30', status: 'completed' },
  { id: '4', roomName: 'Sala Terapia C', date: '10 Nov, 2025', time: '16:00 - 17:00', status: 'cancelled' },
];

type ReservationsScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Reservations'>,
    StackNavigationProp<RootStackParamList>
>;

const getStatusStyle = (status: string, currentColors: ThemeColors) => {
    switch (status) {
        case 'active':
            return { bg: currentColors.primary + '20', text: currentColors.primary, label: 'Agendado' };
        case 'completed':
            return { bg: currentColors.muted + '20', text: currentColors.muted, label: 'Concluído' };
        case 'cancelled':
            return { bg: '#FFE5E5', text: '#D9534F', label: 'Cancelado' };
        default:
            return { bg: currentColors.card, text: currentColors.text, label: status };
    }
};

const ReservationsScreen = () => {
    const navigation = useNavigation<ReservationsScreenNavigationProp>();
    const [reservations, setReservations] = useState(initialReservations);
    
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    // Lógica de Cancelamento (Delete do CRUD)
    const handleCancelReservation = (id: string) => {
        Alert.alert(
            "Cancelar Reserva",
            "Tem certeza que deseja cancelar este agendamento?",
            [
                { text: "Não", style: "cancel" },
                { 
                    text: "Sim, cancelar", 
                    style: "destructive",
                    onPress: () => {
                        // Atualiza o estado localmente para simular o cancelamento
                        setReservations(prev => prev.map(item => 
                            item.id === id ? { ...item, status: 'cancelled' } : item
                        ));
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof initialReservations[0] }) => {
        const statusStyle = getStatusStyle(item.status, currentColors);
        const isActive = item.status === 'active';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.roomName}>{item.roomName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={currentColors.muted} />
                        <Text style={styles.infoText}>{item.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={currentColors.muted} />
                        <Text style={styles.infoText}>{item.time}</Text>
                    </View>
                </View>

                {/* Botão de Ação (Apenas para reservas ativas) */}
                {isActive && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={() => handleCancelReservation(item.id)}
                        >
                            <Ionicons name="close-circle-outline" size={18} color="#C05D5D" />
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Editar", "Funcionalidade de edição.")}>
                             <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Reservas</Text>
                <TouchableOpacity onPress={() => Alert.alert("Histórico", "Filtrar por data")}>
                    <Ionicons name="filter" size={22} color={currentColors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={reservations}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-number-outline" size={64} color={currentColors.muted} />
                        <Text style={styles.emptyText}>Você não tem reservas ativas.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: currentColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: currentColors.background,
        borderBottomWidth: 1,
        borderBottomColor: currentColors.border,
    },
    headerTitle: {
        fontSize: 24,
        color: currentColors.text,
        fontFamily: 'Inter-SemiBold',
    },
    listContent: {
        padding: 24,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: currentColors.muted,
        fontFamily: 'Atkinson-Regular',
    },
    card: {
        backgroundColor: currentColors.card,
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: currentColors.border,
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomName: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 15,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: currentColors.border,
        paddingTop: 12,
        gap: 12,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: theme === 'light' ? '#FFF5F5' : '#3E1F1F',
    },
    cancelButtonText: {
        color: theme === 'light' ? '#C05D5D' : '#E78F8F',
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        marginLeft: 6,
    },
    editButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    editButtonText: {
        color: currentColors.primary,
        fontFamily: 'Inter-Medium',
        fontSize: 14,
    }
});

export default ReservationsScreen;