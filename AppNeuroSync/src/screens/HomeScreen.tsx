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
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';
import { useUser } from '../context/UserContext';

// --- MOCK DE DADOS ---
const allMockSalas = [
    { id: '1', nome: 'Sala Zen 1A', ruido: 'CALMO', luz: 'BAIXA', reservada: false, local: 'Andar 1', desc: 'Ideal para foco profundo e meditação.' },
    { id: '2', nome: 'Sala Foco B', ruido: 'MODERADO', luz: 'ALTA', reservada: false, local: 'Andar 2', desc: 'Boa iluminação para leitura e tarefas ativas.' },
    { id: '3', nome: 'Cabine Silêncio 3', ruido: 'MÁXIMO', luz: 'MÉDIA', reservada: true, local: 'Térreo', desc: 'Isolamento acústico total.' },
    { id: '4', nome: 'Sala Terapia C', ruido: 'CALMO', luz: 'MÉDIA', reservada: false, local: 'Andar 3', desc: 'Ambiente equilibrado para relaxamento.' },
    { id: '5', nome: 'Sala Criativa D', ruido: 'MODERADO', luz: 'MÉDIA', reservada: false, local: 'Andar 1', desc: 'Espaço aberto para brainstorming leve.' },
];

type Room = typeof allMockSalas[0];

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const getStatusColor = (statusValue: string, theme: 'light' | 'dark') => {
    switch (statusValue) {
        case 'CALMO':
        case 'BAIXA':
            return { bg: theme === 'light' ? '#E3F0EA' : '#1F332A', text: theme === 'light' ? '#2D6A4F' : '#81B29A', icon: 'leaf-outline' };
        case 'MODERADO':
        case 'MÉDIA':
            return { bg: theme === 'light' ? '#F4F1EA' : '#3D3828', text: theme === 'light' ? '#9C8228' : '#E0C870', icon: 'git-commit-outline' };
        case 'ALTA':
        case 'MÁXIMO':
            return { bg: theme === 'light' ? '#F9EBEB' : '#3E2525', text: theme === 'light' ? '#C05D5D' : '#E78F8F', icon: 'alert-circle-outline' };
        default:
            return { bg: theme === 'light' ? '#F0F2F5' : '#2A2E33', text: theme === 'light' ? '#6B7280' : '#9CA3AF', icon: 'help-circle-outline' };
    }
};

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {

    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    // --- Estados ---
    const [modalFilterVisible, setModalFilterVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // --- Estados de data/hora ---
    const [reservationDate, setReservationDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const [selectedNoise, setSelectedNoise] = useState<string | null>(null);
    const [selectedLight, setSelectedLight] = useState<string | null>(null);
    const [salas, setSalas] = useState(allMockSalas);

    const availableRoomsCount = salas.filter(s => !s.reservada).length;

    // --- Contexto de Usuário ---
    const { createReservation, user } = useUser();

    // Lógica de seleção de data/hora
    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || reservationDate;

        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (event.type === 'set') {
            setReservationDate(currentDate);
        }
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShowPicker(true);
        setPickerMode(currentMode);
    };

    // Lógica de detalhes e reserva das salas
    const handleOpenDetails = (room: Room) => {
        setSelectedRoom(room);
        setReservationDate(new Date()); // Reseta para agora
        setDetailsModalVisible(true);
    };

    const handleConfirmReservation = async () => {
        setDetailsModalVisible(false);

        if (selectedRoom) {
            const dateStr = reservationDate.toLocaleDateString('pt-BR');
            const timeStr = reservationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // SALVAR NO ASYNC STORAGE VIA CONTEXTO
            await createReservation({
                roomName: selectedRoom.nome,
                local: selectedRoom.local,
                ruido: selectedRoom.ruido,
                luz: selectedRoom.luz,
                date: dateStr,
                time: timeStr
            });

            setSalas(prev => prev.map(s => s.id === selectedRoom.id ? { ...s, reservada: true } : s));

            Toast.show({
                type: 'success',
                text1: 'Reserva Confirmada!',
                text2: `${selectedRoom.nome} agendada com sucesso.`,
            });
        }
    };

    // Filtros
    const applyFilters = () => {
        let filtered = allMockSalas;
        if (selectedNoise) filtered = filtered.filter(sala => sala.ruido === selectedNoise);
        if (selectedLight) filtered = filtered.filter(sala => sala.luz === selectedLight);
        setSalas(filtered);
        setModalFilterVisible(false);
    };

    const clearFilters = () => {
        setSelectedNoise(null);
        setSelectedLight(null);
        setSalas(allMockSalas);
        setModalFilterVisible(false);
    };

    const FilterOption = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
        <TouchableOpacity style={[styles.filterOption, selected && styles.filterOptionSelected]} onPress={onPress}>
            <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: Room }) => {
        const ruidoInfo = getStatusColor(item.ruido, theme);
        const luzInfo = getStatusColor(item.luz, theme);
        const isReserved = item.reservada;

        return (
            <TouchableOpacity
                style={[styles.card, isReserved ? styles.cardReserved : styles.cardAvailable]}
                onPress={() => handleOpenDetails(item)}
                disabled={isReserved}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isReserved && styles.textReserved]}>{item.nome}</Text>
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
                    <View style={[styles.statusTag, { backgroundColor: isReserved ? currentColors.border : ruidoInfo.bg }]}>
                        <Ionicons name={isReserved ? "mic-off-outline" : ruidoInfo.icon as any} size={16} color={isReserved ? currentColors.muted : ruidoInfo.text} />
                        <Text style={[styles.statusText, { color: isReserved ? currentColors.muted : ruidoInfo.text }]}> {item.ruido}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: isReserved ? currentColors.border : luzInfo.bg }]}>
                        <Ionicons name={isReserved ? "eye-off-outline" : "sunny-outline"} size={16} color={isReserved ? currentColors.muted : luzInfo.text} />
                        <Text style={[styles.statusText, { color: isReserved ? currentColors.muted : luzInfo.text }]}> {item.luz}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeContainer}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={currentColors.background} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Olá, {user?.name?.split(' ')[0] || 'Visitante'}</Text>
                    <Text style={styles.headerTitle}>Espaços Calmos</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, (selectedNoise || selectedLight) && styles.iconButtonActive]}
                        onPress={() => setModalFilterVisible(true)}
                    >
                        <Ionicons name="filter" size={22} color={(selectedNoise || selectedLight) ? '#FFF' : currentColors.primary} />
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
                        <Text style={styles.listHeaderTitle}>{availableRoomsCount} Salas Disponíveis</Text>
                        <Text style={styles.listHeaderSubtitle}>
                            {selectedNoise || selectedLight ? "Filtros aplicados." : "Escolha um ambiente adequado para o seu foco."}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={currentColors.muted} />
                        <Text style={styles.emptyText}>Nenhuma sala encontrada.</Text>
                        <TouchableOpacity onPress={clearFilters}><Text style={styles.clearFilterLink}>Limpar Filtros</Text></TouchableOpacity>
                    </View>
                )}
            />

            {/* Modal de detalhes e reserva com data/hora */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDetailsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {selectedRoom && (
                                    <>
                                        <View style={styles.modalHeader}>
                                            <View>
                                                <Text style={styles.modalSubtitle}>{selectedRoom.local}</Text>
                                                <Text style={styles.modalTitle}>{selectedRoom.nome}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeButton}>
                                                <Ionicons name="close" size={24} color={currentColors.text} />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.divider} />

                                        {/* Seletor de data/hora */}
                                        <Text style={styles.sectionLabel}>Selecione a data e hora</Text>
                                        <View style={styles.dateTimeRow}>

                                            {/* Botão de Data */}
                                            <TouchableOpacity style={styles.dateTimeButton} onPress={() => showMode('date')}>
                                                <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
                                                <Text style={styles.dateTimeText}>
                                                    {reservationDate.toLocaleDateString('pt-BR')}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Botão de Hora */}
                                            <TouchableOpacity style={styles.dateTimeButton} onPress={() => showMode('time')}>
                                                <Ionicons name="time-outline" size={20} color={currentColors.primary} />
                                                <Text style={styles.dateTimeText}>
                                                    {reservationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {showPicker && (
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={reservationDate}
                                                mode={pickerMode}
                                                is24Hour={true}
                                                display="default"
                                                onChange={onChangeDate}
                                                style={{ alignSelf: 'center', marginBottom: 10 }}
                                            />
                                        )}

                                        <Text style={styles.sectionLabel}>Condições Atuais</Text>
                                        <View style={styles.detailsRow}>
                                            <View style={[styles.detailBox, { backgroundColor: getStatusColor(selectedRoom.ruido, theme).bg }]}>
                                                <Ionicons name={getStatusColor(selectedRoom.ruido, theme).icon as any} size={24} color={getStatusColor(selectedRoom.ruido, theme).text} />
                                                <Text style={[styles.detailLabel, { color: getStatusColor(selectedRoom.ruido, theme).text }]}>Ruído</Text>
                                                <Text style={[styles.detailValue, { color: getStatusColor(selectedRoom.ruido, theme).text }]}>{selectedRoom.ruido}</Text>
                                            </View>
                                            <View style={[styles.detailBox, { backgroundColor: getStatusColor(selectedRoom.luz, theme).bg }]}>
                                                <Ionicons name="bulb-outline" size={24} color={getStatusColor(selectedRoom.luz, theme).text} />
                                                <Text style={[styles.detailLabel, { color: getStatusColor(selectedRoom.luz, theme).text }]}>Luz</Text>
                                                <Text style={[styles.detailValue, { color: getStatusColor(selectedRoom.luz, theme).text }]}>{selectedRoom.luz}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.modalFooter}>
                                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmReservation}>
                                                <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal de filtros */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalFilterVisible}
                onRequestClose={() => setModalFilterVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalFilterVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filtros Sensoriais</Text>
                                    <TouchableOpacity onPress={() => setModalFilterVisible(false)}>
                                        <Ionicons name="close" size={24} color={currentColors.text} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.filterSectionTitle}>Nível de Ruído</Text>
                                <View style={styles.filterRow}>
                                    <FilterOption label="CALMO" selected={selectedNoise === 'CALMO'} onPress={() => setSelectedNoise(selectedNoise === 'CALMO' ? null : 'CALMO')} />
                                    <FilterOption label="MODERADO" selected={selectedNoise === 'MODERADO'} onPress={() => setSelectedNoise(selectedNoise === 'MODERADO' ? null : 'MODERADO')} />
                                </View>
                                <Text style={styles.filterSectionTitle}>Intensidade de Luz</Text>
                                <View style={styles.filterRow}>
                                    <FilterOption label="BAIXA" selected={selectedLight === 'BAIXA'} onPress={() => setSelectedLight(selectedLight === 'BAIXA' ? null : 'BAIXA')} />
                                    <FilterOption label="MÉDIA" selected={selectedLight === 'MÉDIA'} onPress={() => setSelectedLight(selectedLight === 'MÉDIA' ? null : 'MÉDIA')} />
                                    <FilterOption label="ALTA" selected={selectedLight === 'ALTA'} onPress={() => setSelectedLight(selectedLight === 'ALTA' ? null : 'ALTA')} />
                                </View>
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}><Text style={styles.clearButtonText}>Limpar</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.applyButton} onPress={applyFilters}><Text style={styles.applyButtonText}>Aplicar</Text></TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    );
};

const getStyles = (currentColors: ThemeColors, theme: 'light' | 'dark') => StyleSheet.create({
    safeContainer: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: currentColors.background
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
    iconButtonActive: {
        backgroundColor: currentColors.primary,
        borderColor: currentColors.primary,
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
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: currentColors.text,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        marginBottom: 4,
    },
    closeButton: {
        padding: 4,
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.muted,
        marginBottom: 10,
        marginTop: 5,
        textTransform: 'uppercase',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: theme === 'light' ? '#F8FAFC' : '#16181D',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: currentColors.border,
        gap: 8,
        justifyContent: 'center',
    },
    dateTimeText: {
        fontSize: 16,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.text,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    detailBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 5,
    },
    detailLabel: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        opacity: 0.8,
    },
    detailValue: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginTop: 4,
    },
    descriptionBox: {
        backgroundColor: theme === 'light' ? '#F8F9FA' : '#1A1D21',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        lineHeight: 22,
    },
    confirmButton: {
        backgroundColor: currentColors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        width: '100%',
    },
    confirmButtonText: {
        color: currentColors.background,
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
    },
    filterSectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.muted,
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    filterOption: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: currentColors.border,
        backgroundColor: 'transparent',
    },
    filterOptionSelected: {
        backgroundColor: currentColors.primary,
        borderColor: currentColors.primary,
    },
    filterOptionText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: currentColors.text,
    },
    filterOptionTextSelected: {
        color: currentColors.background,
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.7,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: currentColors.muted,
        fontFamily: 'Atkinson-Regular',
        textAlign: 'center',
    },
    clearFilterLink: {
        marginTop: 15,
        color: currentColors.primary,
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
});

export default HomeScreen;