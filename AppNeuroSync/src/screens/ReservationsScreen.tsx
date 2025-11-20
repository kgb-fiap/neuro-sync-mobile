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
    TouchableWithoutFeedback,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

// --- MOCK DE DADOS DE RESERVAS ---
const initialReservations = [
    { id: '1', roomName: 'Sala Zen 1A', date: '19 Nov, 2025', time: '14:00 - 15:00', status: 'active' },
    { id: '2', roomName: 'Sala Foco B', date: '20 Nov, 2025', time: '09:00 - 11:00', status: 'active' },
    { id: '3', roomName: 'Cabine Silêncio 3', date: '15 Nov, 2025', time: '10:00 - 10:30', status: 'completed' },
    { id: '4', roomName: 'Sala Terapia C', date: '19 Nov, 2025', time: '16:00 - 17:00', status: 'cancelled' },
];

type Reservation = typeof initialReservations[0];

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
    
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme, false); // isFiltering false por padrão

    // --- Estados principais ---
    const [reservations, setReservations] = useState(initialReservations);

    // --- Estados de filtro ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterDate, setFilterDate] = useState<Date>(new Date());
    const [isFiltering, setIsFiltering] = useState(false);

    // --- Estados de edição ---
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    
    // --- Estados temporários para edição ---
    const [editDate, setEditDate] = useState<Date>(new Date());
    const [editTimeStart, setEditTimeStart] = useState("09:00");
    
    // --- Estados para o DatePicker nativo ---
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    // Define quem está chamando o picker: 'filter' ou 'edit'
    const [pickerContext, setPickerContext] = useState<'filter' | 'edit'>('filter'); 


    // --- LÓGICA DE DATE PICKER NATIVO ---
    const showDatePicker = (mode: 'date' | 'time', context: 'filter' | 'edit') => {
        setPickerMode(mode);
        setPickerContext(context);
        setShowPicker(true);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);

        if (event.type === 'set' && selectedDate) {
            if (pickerContext === 'filter') {
                setFilterDate(selectedDate);
            } else {
                // Contexto de Edição
                if (pickerMode === 'date') {
                    setEditDate(selectedDate);
                } else {
                    // Se for horário, atualiza a string de hora
                    const timeStr = selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    setEditTimeStart(timeStr);
                }
            }
        }
    };

    // Funções de filtro
    const applyFilter = () => {
        const targetString = filterDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        // Ex: "19 Nov, 2025" (formato do mock) - Ajuste conforme seu locale real
        // Para simplificar o mock, vamos usar uma comparação básica de string
        // Na vida real, usaria objetos Date reais nas reservas
        
        // Mock de formatação para bater com "19 Nov, 2025"
        const day = filterDate.getDate();
        const month = filterDate.toLocaleDateString('en-US', { month: 'short' });
        const year = filterDate.getFullYear();
        const searchStr = `${day} ${month}, ${year}`;

        const filtered = initialReservations.filter(res => res.date === searchStr);
        setReservations(filtered);
        setIsFiltering(true);
        setFilterModalVisible(false);
    };

    const clearFilter = () => {
        setReservations(initialReservations);
        setIsFiltering(false);
        setFilterModalVisible(false);
    };

    // Funções de edição
    const handleOpenEdit = (reservation: Reservation) => {
        setEditingReservation(reservation);
        // Parser simples da data string para objeto Date (Mock)
        // Na vida real: new Date(reservation.dateISO)
        setEditDate(new Date()); 
        setEditTimeStart(reservation.time.split(' - ')[0]); // Pega o horário inicial
        setEditModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (!editingReservation) return;

        // Formata a nova data para string (padrão do mock)
        const day = editDate.getDate();
        const month = editDate.toLocaleDateString('en-US', { month: 'short' });
        const year = editDate.getFullYear();
        const newDateStr = `${day} ${month}, ${year}`;
        
        // Cria novo horário (mantendo duração de 1h fixa para o mock)
        const newTimeStr = `${editTimeStart} - ...`; 

        setReservations(prev => prev.map(res => 
            res.id === editingReservation.id 
                ? { ...res, date: newDateStr, time: newTimeStr }
                : res
        ));

        setEditModalVisible(false);
        Alert.alert("Sucesso", "Reserva atualizada com sucesso!");
    };


    // Lógica de cancelamento
    const handleCancelReservation = (id: string) => {
        Alert.alert(
            "Cancelar Reserva",
            "Tem certeza que deseja cancelar?",
            [
                { text: "Não", style: "cancel" },
                { 
                    text: "Sim, cancelar", 
                    style: "destructive",
                    onPress: () => {
                        setReservations(prev => prev.map(item => 
                            item.id === id ? { ...item, status: 'cancelled' } : item
                        ));
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Reservation }) => {
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
                            <Ionicons name="close-circle-outline" size={18} color="#D9534F" />
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEdit(item)}>
                             <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.safeContainer}>
            <StatusBar 
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Reservas</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
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
                             <TouchableOpacity onPress={clearFilter}>
                                <Text style={styles.clearFilterLink}>Limpar Filtro</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={pickerContext === 'filter' ? filterDate : editDate}
                    mode={pickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Modal de filtro de data */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filtrar por data:</Text>
                                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={currentColors.text} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.filterSectionTitle}>Data Desejada</Text>
                                <TouchableOpacity 
                                    style={styles.datePickerButton} 
                                    onPress={() => showDatePicker('date', 'filter')}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
                                    <Text style={styles.datePickerText}>
                                        {filterDate.toLocaleDateString('pt-BR')}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity style={styles.clearButton} onPress={clearFilter}>
                                        <Text style={styles.clearButtonText}>Limpar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                                        <Text style={styles.applyButtonText}>Filtrar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            {/* ================================================= */}
            {/* MODAL DE EDIÇÃO (Data e Hora)                     */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Editar Reserva</Text>
                                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={currentColors.text} />
                                    </TouchableOpacity>
                                </View>
                                
                                {editingReservation && (
                                    <>
                                        <Text style={styles.roomNameTitle}>{editingReservation.roomName}</Text>
                                        <View style={styles.divider} />

                                        <Text style={styles.filterSectionTitle}>Nova Data</Text>
                                        <TouchableOpacity 
                                            style={styles.datePickerButton} 
                                            onPress={() => showDatePicker('date', 'edit')}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
                                            <Text style={styles.datePickerText}>
                                                {editDate.toLocaleDateString('pt-BR')}
                                            </Text>
                                        </TouchableOpacity>

                                        <Text style={styles.filterSectionTitle}>Novo Horário (Início)</Text>
                                        <TouchableOpacity 
                                            style={styles.datePickerButton} 
                                            onPress={() => showDatePicker('time', 'edit')}
                                        >
                                            <Ionicons name="time-outline" size={20} color={currentColors.primary} />
                                            <Text style={styles.datePickerText}>
                                                {editTimeStart}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={styles.modalFooter}>
                                            <TouchableOpacity style={styles.clearButton} onPress={() => setEditModalVisible(false)}>
                                                <Text style={styles.clearButtonText}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.applyButton} onPress={handleSaveEdit}>
                                                <Text style={styles.applyButtonText}>Salvar Alterações</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark', isFiltering: boolean) => StyleSheet.create({
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
    clearFilterLink: {
        marginTop: 15,
        color: currentColors.primary,
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
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
    roomNameTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: currentColors.primary,
        marginBottom: 10,
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
        color: '#D9534F',
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
        marginBottom: 20,
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
        marginBottom: 20,
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
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginBottom: 16,
        opacity: 0.5,
    },
});

export default ReservationsScreen;