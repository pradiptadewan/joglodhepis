"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (token: string, userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('userData');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = (newToken: string, newData: any) => {
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('userData', JSON.stringify(newData));
        setToken(newToken);
        setUser(newData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{ 
            user, token, login, logout, isAuthenticated,
            isAuthModalOpen, openAuthModal, closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};