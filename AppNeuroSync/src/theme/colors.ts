// Interface de definição das cores do tema
export interface ThemeColors {
    background: string;
    text: string;
    primary: string;
    card: string;
    muted: string;
    border: string;
}

// Tipo para os nomes dos temas disponíveis
export type ThemeName = 'light' | 'dark';

// Definição das cores para cada tema
export const colors = {
    light: {
        background: '#F8F8F3',
        text: '#0F2A3F',
        primary: '#3A8EA5',
        secondary: '#5CB8A6',
        card: '#FFFFFF',
        muted: '#6C7A86',
        border: '#D8E0E5'
    },
    dark: {
        background: '#0F1A1F',
        text: '#E7F0F4',
        primary: '#4AB0C8',
        secondary: '#6FD1BD',
        card: '#1C2A30',
        muted: '#8FA3AD',
        border: '#26404A'
    },
};