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
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useUser, Reservation } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

type ReservationsScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Reservations'>,
    StackNavigationProp<RootStackParamList>
>;

// Função auxiliar para cores
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
    const [isFiltering, setIsFiltering] = useState(false);
    const styles = getStyles(currentColors, theme, isFiltering);

    // --- Estado para as reservas ---
    const { reservations, cancelReservation, updateReservation } = useUser();

    // --- Estados de filtros ---
    const [filteredReservations, setFilteredReservations] = useState<Reservation[] | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterDate, setFilterDate] = useState<Date>(new Date());

    // --- Estados para os modais --- ---
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    const [editDate, setEditDate] = useState<Date>(new Date());
    const [editTimeStart, setEditTimeStart] = useState("09:00");

    // Estados para o DatePicker (Nativo)
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [pickerContext, setPickerContext] = useState<'filter' | 'edit'>('filter');

    // Dados a serem exibidos (Filtrados ou Todos)
    const displayData = filteredReservations || reservations;

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
                // Edição
                if (pickerMode === 'date') {
                    setEditDate(selectedDate);
                } else {
                    const timeStr = selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    setEditTimeStart(timeStr);
                }
            }
        }
    };

    // Função para cancelar reserva
    const handleCancelReservation = (id: string) => {
        Alert.alert(
            "Cancelar Reserva?", // Título claro
            "Esta ação liberará a sala para outras pessoas.",
            [
                { text: "Manter Reserva", style: "cancel" },
                {
                    text: "Sim, Cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await cancelReservation(id);
                            if (isFiltering) clearFilter();

                            // TOAST: Feedback de sucesso após a ação
                            Toast.show({
                                type: 'success',
                                text1: 'Cancelado',
                                text2: 'A reserva foi removida da sua agenda.',
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erro',
                                text2: 'Falha ao cancelar. Tente novamente.',
                            });
                        }
                    }
                }
            ]
        );
    };

    // Função para abrir modal de edição
    const handleOpenEdit = (reservation: Reservation) => {
        setEditingReservation(reservation);
        // Tenta converter a string de data de volta para objeto Date (simplificado)
        // Como salvamos string formatada, aqui resetamos para 'hoje' para facilitar o exemplo
        setEditDate(new Date());
        setEditTimeStart(reservation.time.split(' - ')[0]);
        setEditModalVisible(true);
    };

    // Função para salvar edição
    const handleSaveEdit = async () => {
        if (!editingReservation) return;

        const day = editDate.getDate();
        // Garantir mês com letra maiúscula ou padrão consistente
        const month = editDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const year = editDate.getFullYear();

        // Formato deve bater com o que usamos no createReservation
        const newDateStr = editDate.toLocaleDateString('pt-BR');
        const newTimeStr = editTimeStart;

        try {
            await updateReservation(editingReservation.id, {
                date: newDateStr,
                time: newTimeStr
            });

            setEditModalVisible(false);

            // TOAST: Feedback leve de sucesso
            Toast.show({
                type: 'success',
                text1: 'Atualizado',
                text2: 'Sua reserva foi remarcada com sucesso.',
            });

            if (isFiltering) clearFilter();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível atualizar a reserva.',
            });
        }
    };

    // Aplicar filtro
    const applyFilter = () => {
        // Filtro exato pela string de data (simplificado)
        // O ideal seria comparar timestamps, mas vamos comparar a string formatada
        const targetString = filterDate.toLocaleDateString('pt-BR');

        const filtered = reservations.filter(res => res.date === targetString);

        setFilteredReservations(filtered);
        setIsFiltering(true);
        setFilterModalVisible(false);
    };

    const clearFilter = () => {
        setFilteredReservations(null);
        setIsFiltering(false);
        setFilterModalVisible(false);
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
                    {item.local && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={16} color={currentColors.muted} />
                            <Text style={[styles.infoText, { fontFamily: 'Inter-Medium', color: currentColors.text }]}>
                                {item.roomName} {item.local ? `• ${item.local}` : ''}
                            </Text>
                        </View>
                    )}
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
        <SafeAreaView style={styles.safeContainer}>
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
                data={displayData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-number-outline" size={64} color={currentColors.muted} />
                        <Text style={styles.emptyText}>
                            {isFiltering ? "Nenhuma reserva nesta data." : "Você não tem reservas."}
                        </Text>
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

            {/* Modal de filtro */}
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
                                    <Text style={styles.modalTitle}>Filtrar por Data</Text>
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
                                        <Text style={styles.clearButtonText}>Todos</Text>
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

            {/* Modal de edição */}
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

                                        <Text style={styles.filterSectionTitle}>Novo Horário</Text>
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
                                                <Text style={styles.applyButtonText}>Salvar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </SafeAreaView>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark', isFiltering: boolean) => StyleSheet.create({
    safeContainer: {
        flex: 1,
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
        paddingBottom: 100,
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