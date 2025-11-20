import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Linking,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

// --- MOCK DE FAQ ---
const faqs = [
    {
        id: 1,
        question: "Como o sensor de ruído funciona?",
        answer: "Nossas salas são equipadas com sensores IoT que monitoram decibéis em tempo real. O status 'CALMO' indica ruído abaixo de 40dB, ideal para hiperfoco."
    },
    {
        id: 2,
        question: "Posso ajustar a iluminação da sala?",
        answer: "As salas marcadas como 'Luz Ajustável' possuem dimmers físicos. O app mostra apenas a leitura atual do sensor de luminosidade."
    },
    {
        id: 3,
        question: "Como cancelo uma reserva?",
        answer: "Vá para a aba 'Reservas', encontre o agendamento ativo e toque no botão 'Cancelar'. O status mudará imediatamente."
    },
    {
        id: 4,
        question: "O que fazer se a sala estiver ocupada?",
        answer: "Se você reservou mas a sala está ocupada, utilize o botão 'Reportar Problema' abaixo ou contate a recepção imediatamente."
    }
];

type HelpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Help'>;

interface Props {
    navigation: HelpScreenNavigationProp;
}

const HelpScreen: React.FC<Props> = ({ navigation }) => {
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    // Estado para controlar qual FAQ está aberto
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const handleContactSupport = (type: 'email' | 'phone') => {
        if (type === 'email') {
            Linking.openURL('mailto:suporte@neurosync.com');
        } else {
            Linking.openURL('tel:+5511999999999');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
                backgroundColor={currentColors.background}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={currentColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Canais de Atendimento</Text>
                
                <View style={styles.contactContainer}>
                    <TouchableOpacity style={styles.contactButton} onPress={() => handleContactSupport('email')}>
                        <View style={[styles.iconCircle, { backgroundColor: currentColors.primary + '20' }]}>
                            <Ionicons name="mail-outline" size={24} color={currentColors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactTitle}>E-mail</Text>
                            <Text style={styles.contactSubtitle}>Resposta em até 24h</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={() => handleContactSupport('phone')}>
                        <View style={[styles.iconCircle, { backgroundColor: currentColors.primary + '20' }]}>
                            <Ionicons name="call-outline" size={24} color={currentColors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactTitle}>Telefone</Text>
                            <Text style={styles.contactSubtitle}>Seg-Sex, 9h às 18h</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>

                {faqs.map((faq) => {
                    const isExpanded = expandedId === faq.id;
                    return (
                        <View key={faq.id} style={styles.faqCard}>
                            <TouchableOpacity 
                                style={styles.faqHeader} 
                                onPress={() => toggleExpand(faq.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.faqQuestion, isExpanded && { color: currentColors.primary }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons 
                                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={isExpanded ? currentColors.primary : currentColors.muted} 
                                />
                            </TouchableOpacity>
                            
                            {isExpanded && (
                                <View style={styles.faqBody}>
                                    <View style={styles.divider} />
                                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Neuro-Sync App</Text>
                    <Text style={styles.footerSubText}>Versão 1.0.2 • Build 2025.11</Text>
                </View>

            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: currentColors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: currentColors.muted,
        textTransform: 'uppercase',
        marginBottom: 15,
        marginTop: 10,
        letterSpacing: 0.5,
    },
    contactContainer: {
        gap: 12,
        marginBottom: 30,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: currentColors.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: currentColors.border,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.text,
    },
    contactSubtitle: {
        fontSize: 14,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
    },
    faqCard: {
        backgroundColor: currentColors.card,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: currentColors.border,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqQuestion: {
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        color: currentColors.text,
        flex: 1,
        marginRight: 10,
        lineHeight: 22,
    },
    faqBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginBottom: 12,
        opacity: 0.5,
    },
    faqAnswer: {
        fontSize: 15,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.text,
        lineHeight: 24,
        opacity: 0.9,
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: currentColors.primary,
    },
    footerSubText: {
        fontSize: 12,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        marginTop: 4,
    }
});

export default HelpScreen;