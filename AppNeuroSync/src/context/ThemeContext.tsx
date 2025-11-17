import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a "forma" do nosso contexto: um tema (string) e uma função para alterná-lo.
interface ThemeContextData {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

// Cria o Contexto do Tema com um valor padrão (que será substituído pelo Provedor)
const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

// Provedor do Tema que envolve o app e gerencia o estado do tema
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    // Define o estado inicial do tema com base no sistema do usuário (fallback para 'light').
    const [theme, setTheme] = useState<'light' | 'dark'>(Appearance.getColorScheme() || 'light');

    // Efeito para carregar o tema salvo (roda apenas uma vez ao iniciar o app)
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('@theme');
                if (savedTheme !== null) {
                    setTheme(savedTheme as 'light' | 'dark');
                }
            } catch (error) {
                console.error("Failed to load theme from storage", error);
            }
        };

        loadTheme();
    }, []);

    // Função para alternar entre temas claro e escuro e armazenar a preferência
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('@theme', newTheme);
        } catch (error) {
            console.error("Failed to save theme to storage", error);
        }
    };

    // Fornece o tema atual e a função de troca para todos os componentes filhos.
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personalizado para usar o contexto do tema
function useTheme(): ThemeContextData {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { ThemeProvider, useTheme };