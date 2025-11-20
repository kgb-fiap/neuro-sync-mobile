import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storage';

// --- Tipos ---
export interface UserProfile {
    name: string;
    email: string;
    sensoryProfile: string;
}

export interface Reservation {
    id: string;
    roomName: string;
    date: string;
    time: string;
    status: 'active' | 'completed' | 'cancelled';
    local: string;
    ruido: string;
    luz: string;
}

interface UserContextData {
    user: UserProfile | null;
    reservations: Reservation[];
    isLoading: boolean;
    login: (email: string) => Promise<boolean>; 
    register: (data: UserProfile) => Promise<void>;
    logout: () => Promise<void>;
    createReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => Promise<void>;
    cancelReservation: (id: string) => Promise<void>;
    updateReservation: (id: string, newData: Partial<Reservation>) => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // CARREGAR DADOS AO INICIAR
    useEffect(() => {
        async function loadData() {
            const storedUser = await storageService.get(STORAGE_KEYS.USER);
            const storedReservations = await storageService.get(STORAGE_KEYS.RESERVATIONS);

            if (storedUser) setUser(storedUser);
            if (storedReservations) setReservations(storedReservations);
            
            setIsLoading(false);
        }
        loadData();
    }, []);

    // CADASTRO (Salva Perfil)
    const register = async (userData: UserProfile) => {
        setUser(userData);
        await storageService.save(STORAGE_KEYS.USER, userData);
        // Ao cadastrar limpa reservas antigas de outros usuários (testes)
        setReservations([]); 
        await storageService.save(STORAGE_KEYS.RESERVATIONS, []);
    };

    // LOGIN (Apenas verifica se existe usuário salvo)
    const login = async (email: string): Promise<boolean> => {
        // Validação simples para simular o login
        const storedUser = await storageService.get(STORAGE_KEYS.USER);
        if (storedUser && storedUser.email === email) {
            setUser(storedUser);
            return true;
        }
        return false; 
    };

    // LOGOUT
    const logout = async () => {
        setUser(null);
        await storageService.remove(STORAGE_KEYS.USER); 
    };

    // CRIAR RESERVA
    const createReservation = async (data: Omit<Reservation, 'id' | 'status'>) => {
        const newReservation: Reservation = {
            id: Date.now().toString(),
            status: 'active',
            ...data
        };

        const updatedList = [newReservation, ...reservations];
        setReservations(updatedList);
        await storageService.save(STORAGE_KEYS.RESERVATIONS, updatedList);
    };

    // CANCELAR RESERVA
    const cancelReservation = async (id: string) => {
        const updatedList = reservations.map(res => 
            res.id === id ? { ...res, status: 'cancelled' as const } : res
        );
        setReservations(updatedList);
        await storageService.save(STORAGE_KEYS.RESERVATIONS, updatedList);
    };

    // EDITAR RESERVA
    const updateReservation = async (id: string, newData: Partial<Reservation>) => {
        const updatedList = reservations.map(res => 
            res.id === id ? { ...res, ...newData } : res
        );
        setReservations(updatedList);
        await storageService.save(STORAGE_KEYS.RESERVATIONS, updatedList);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            reservations, 
            isLoading,
            login, 
            register, 
            logout, 
            createReservation, 
            cancelReservation, 
            updateReservation 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);