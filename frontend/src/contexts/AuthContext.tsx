import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { emotionAPI, AuthUser } from '../services/api';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await emotionAPI.login(email, password);
            console.log('Login response:', response);

            // Ensure we use the token from the response
            if (!response.token) {
                throw new Error('No token received from login');
            }

            const authToken = response.token;

            // Persist to localStorage FIRST
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('auth_user', JSON.stringify(response.user));

            // Then update state
            setToken(authToken);
            setUser(response.user);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, fullName?: string) => {
        try {
            const response = await emotionAPI.register(email, password, fullName);
            console.log('Registration response:', response);

            // Ensure we use the token from the response
            if (!response.token) {
                throw new Error('No token received from registration');
            }

            const authToken = response.token;

            // Persist to localStorage FIRST
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('auth_user', JSON.stringify(response.user));

            // Then update state
            setToken(authToken);
            setUser(response.user);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
