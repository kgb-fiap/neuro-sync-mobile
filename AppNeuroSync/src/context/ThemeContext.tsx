import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { ThemeName } from '../theme/colors';
import { storageService, STORAGE_KEYS } from '../services/storage';

interface ThemeContextData {
    theme: ThemeName;
    toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // Estado Inicial: Tenta pegar do sistema, senão 'light'
    const [theme, setTheme] = useState<ThemeName>(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );

    // Carrega o tema salvo no storage ao iniciar
    useEffect(() => {
        async function loadTheme() {
            const savedTheme = await storageService.get(STORAGE_KEYS.THEME);
            if (savedTheme) {
                setTheme(savedTheme);
            }
        }
        loadTheme();
    }, []);

    // Alterna o tema e salva
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await storageService.save(STORAGE_KEYS.THEME, newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme(): ThemeContextData {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}