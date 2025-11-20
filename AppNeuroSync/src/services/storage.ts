import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    USER: '@neurosync:user',
    RESERVATIONS: '@neurosync:reservations',
    THEME: '@neurosync:theme',
};

export const storageService = {
    save: async (key: string, value: any) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error("Erro ao salvar dados", e);
        }
    },

    get: async (key: string) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error("Erro ao ler dados", e);
            return null;
        }
    },

    remove: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error("Erro ao remover dados", e);
        }
    }
};