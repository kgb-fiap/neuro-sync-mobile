import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Switch,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

import { useTheme } from '../context/ThemeContext';
import { colors, ThemeColors } from '../theme/colors';

type AccessibilityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Accessibility'>;

interface Props {
    navigation: AccessibilityScreenNavigationProp;
}

const AccessibilityScreen: React.FC<Props> = ({ navigation }) => {

    const { theme } = useTheme();
    const currentColors = colors[theme];
    const styles = getStyles(currentColors, theme);

    // --- Estados de configuração ---
    const [highContrast, setHighContrast] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [dyslexiaFont, setDyslexiaFont] = useState(false);
    const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');

    // Componente auxiliar para Toggle (Switch)
    const SettingToggle = ({ label, description, value, onValueChange }: { label: string, description?: string, value: boolean, onValueChange: (val: boolean) => void }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{label}</Text>
                {description && <Text style={styles.settingDescription}>{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: currentColors.border, true: currentColors.primary }}
                thumbColor={theme === 'light' ? '#FFF' : '#f4f3f4'}
                ios_backgroundColor={currentColors.border}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

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
                <Text style={styles.headerTitle}>Acessibilidade</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Leitura e Texto</Text>
                
                <View style={styles.card}>
                    <Text style={styles.settingLabel}>Tamanho da Fonte</Text>
                    <Text style={styles.settingDescription}>Ajuste o tamanho do texto para melhor leitura.</Text>
                    
                    <View style={styles.textSizeContainer}>
                        <TouchableOpacity 
                            style={[styles.sizeButton, textSize === 'small' && styles.sizeButtonSelected]} 
                            onPress={() => setTextSize('small')}
                        >
                            <Text style={[styles.sizeTextSmall, textSize === 'small' && styles.sizeTextSelected]}>A</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.sizeButton, textSize === 'medium' && styles.sizeButtonSelected]} 
                            onPress={() => setTextSize('medium')}
                        >
                            <Text style={[styles.sizeTextMedium, textSize === 'medium' && styles.sizeTextSelected]}>A</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.sizeButton, textSize === 'large' && styles.sizeButtonSelected]} 
                            onPress={() => setTextSize('large')}
                        >
                            <Text style={[styles.sizeTextLarge, textSize === 'large' && styles.sizeTextSelected]}>A</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <SettingToggle 
                        label="Fonte para Dislexia" 
                        description="Altera a fonte para OpenDyslexic (Simulado)."
                        value={dyslexiaFont}
                        onValueChange={setDyslexiaFont}
                    />
                </View>

                <Text style={styles.sectionTitle}>Visual e Cores</Text>
                
                <View style={styles.card}>
                    <SettingToggle 
                        label="Alto Contraste" 
                        description="Aumenta a diferença entre cores de texto e fundo."
                        value={highContrast}
                        onValueChange={setHighContrast}
                    />
                    
                    <View style={styles.divider} />
                    
                    <SettingToggle 
                        label="Reduzir Transparência" 
                        value={false}
                        onValueChange={() => {}}
                    />
                </View>

                <Text style={styles.sectionTitle}>Movimento</Text>
                
                <View style={styles.card}>
                    <SettingToggle 
                        label="Reduzir Movimento" 
                        description="Diminui animações de transição para evitar vertigem."
                        value={reduceMotion}
                        onValueChange={setReduceMotion}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.resetButton} 
                    onPress={() => Alert.alert("Redefinir", "Restaurar configurações padrão?", [{text: "Cancelar"}, {text: "Sim"}])}
                >
                    <Text style={styles.resetButtonText}>Restaurar Padrões</Text>
                </TouchableOpacity>

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
        marginBottom: 12,
        marginTop: 10,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: currentColors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: currentColors.border,
        marginBottom: 24,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: currentColors.text,
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        fontFamily: 'Atkinson-Regular',
        color: currentColors.muted,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: currentColors.border,
        marginVertical: 16,
    },
    textSizeContainer: {
        flexDirection: 'row',
        backgroundColor: theme === 'light' ? '#F0F2F5' : '#2C3036',
        borderRadius: 12,
        padding: 4,
        marginTop: 12,
    },
    sizeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    sizeButtonSelected: {
        backgroundColor: currentColors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sizeTextSmall: { fontSize: 14, fontFamily: 'Inter-Medium', color: currentColors.muted },
    sizeTextMedium: { fontSize: 18, fontFamily: 'Inter-Medium', color: currentColors.muted },
    sizeTextLarge: { fontSize: 24, fontFamily: 'Inter-Medium', color: currentColors.muted },
    
    sizeTextSelected: {
        color: currentColors.primary,
        fontFamily: 'Inter-Bold',
    },
    resetButton: {
        alignItems: 'center',
        padding: 16,
        marginTop: 10,
    },
    resetButtonText: {
        color: '#D9534F',
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        marginBottom: 30,
    }
});

export default AccessibilityScreen;