import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../App';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

// Biblioteca externa para data deve ser instalada (simulada aqui)
// const DateTimePicker = require('@react-native-community/datetimepicker').default;

// --- MOCK DE DADOS DE RESERVAS ---
const initialReservations = [
    { id: '1', roomName: 'Sala Zen 1A', date: '19 Nov, 2025', time: '14:00 - 15:00', status: 'active' },
    { id: '2', roomName: 'Sala Foco B', date: '20 Nov, 2025', time: '09:00 - 11:00', status: 'active' },
    { id: '3', roomName: 'Cabine Silêncio 3', date: '15 Nov, 2025', time: '10:00 - 10:30', status: 'completed' },
    { id: '4', roomName: 'Sala Terapia C', date: '19 Nov, 2025', time: '16:00 - 17:00', status: 'cancelled' },
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
    
    // --- ESTADOS DE FILTRO ---
    const [reservations, setReservations] = useState(initialReservations);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isFiltering, setIsFiltering] = useState(false); // Para mudar o ícone de filtro

    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme, isFiltering);

    // --- FUNÇÕES DE FILTRAGEM ---

    const applyDateFilter = () => {
        // Formato da string no mock: "19 Nov, 2025"
        const targetDay = selectedDate.getDate();
        const targetMonth = selectedDate.toLocaleDateString('en-US', { month: 'short' });
        const targetYear = selectedDate.getFullYear();
        
        // Exemplo de string de alvo: "19 Nov, 2025"
        const targetString = `${targetDay} ${targetMonth}, ${targetYear}`;
        
        const filtered = initialReservations.filter(res => 
            res.date.includes(targetString)
        );

        setReservations(filtered);
        setIsFiltering(true);
        setModalVisible(false);
    };

    const clearDateFilter = () => {
        setSelectedDate(new Date());
        setReservations(initialReservations);
        setIsFiltering(false);
        setModalVisible(false);
    };
    
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
                        setReservations(prev => prev.map(item => 
                            item.id === id ? { ...item, status: 'cancelled' } : item
                        ));
                        // Aplicar o filtro novamente caso estivesse ativo
                        if (isFiltering) applyDateFilter();
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
                {/* BOTÃO QUE ABRE O MODAL */}
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons 
                        name={isFiltering ? "filter" : "filter-outline"} 
                        size={22} 
                        color={isFiltering ? currentColors.primary : currentColors.muted} 
                    />
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
                        <Text style={styles.emptyText}>Nenhuma reserva encontrada.</Text>
                        {isFiltering && (
                             <TouchableOpacity onPress={clearDateFilter}>
                                <Text style={styles.clearFilterLink}>Limpar Filtro</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {/* --- MODAL DE FILTROS --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filtrar reservas por data:</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={currentColors.text} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.filterSectionTitle}>Data da Reserva</Text>
                                
                                {/* 3. SIMULAÇÃO DO DATE PICKER */}
                                <TouchableOpacity 
                                    style={styles.datePickerButton} 
                                    onPress={() => Alert.alert("Seletor de Data", "Aqui o picker nativo seria aberto.")}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
                                    <Text style={styles.datePickerText}>
                                        {selectedDate.toLocaleDateString('pt-BR')}
                                    </Text>
                                </TouchableOpacity>
                                
                                {/* (O DateTimePicker real ficaria aqui, após a importação) */}
                                {/* {showPicker && (
                                    <DateTimePicker 
                                        value={selectedDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event, date) => {
                                            if (date) setSelectedDate(date);
                                        }}
                                    />
                                )} */}


                                <View style={styles.modalFooter}>
                                    <TouchableOpacity style={styles.clearButton} onPress={clearDateFilter}>
                                        <Text style={styles.clearButtonText}>Limpar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.applyButton} onPress={applyDateFilter}>
                                        <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark', isFiltering: boolean) => StyleSheet.create({
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
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: currentColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: currentColors.text,
    },
    filterSectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.muted,
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: currentColors.border,
        gap: 10,
        marginBottom: 30,
        backgroundColor: currentColors.card,
    },
    datePickerText: {
        fontSize: 16,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.text,
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 10,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: currentColors.border,
    },
    clearButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: currentColors.primary,
    },
    applyButtonText: {
        fontFamily: 'Inter-SemiBold',
        color: currentColors.background,
    },
    clearFilterLink: {
        marginTop: 15,
        color: currentColors.primary,
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    }
});

export default ReservationsScreen;