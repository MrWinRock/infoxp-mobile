import { API_BASE_URL } from '@config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logEvent } from './logEvent';

type RequestConfigWithMeta = InternalAxiosRequestConfig & {
    metadata?: { start: number };
};

const now = () =>
    typeof globalThis.performance?.now === 'function'
        ? globalThis.performance.now()
        : Date.now();

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            cfg.headers = cfg.headers || {};
            (cfg.headers as any).Authorization = `Bearer ${token}`;
        }

        (cfg as RequestConfigWithMeta).metadata = { start: now() };

        const method = (cfg.method || 'get').toUpperCase();
        const url = `${cfg.baseURL || ''}${cfg.url || ''}`;
        logEvent(`HTTP ${method} ${url}`);
        return cfg;
    },
    err => {
        logEvent(`HTTP REQUEST ERROR: ${String(err)}`);
        return Promise.reject(err);
    }
);

apiClient.interceptors.response.use(
    (res: AxiosResponse) => {
        const start = (res.config as RequestConfigWithMeta).metadata?.start;
        const ms = typeof start === 'number' ? Math.round(now() - start) : undefined;
        const method = (res.config.method || 'get').toUpperCase();
        const url = `${res.config.baseURL || ''}${res.config.url || ''}`;
        logEvent(`HTTP ${res.status} ${method} ${url}${ms !== undefined ? ` ${ms}ms` : ''}`);
        return res;
    },
    err => {
        const cfg: InternalAxiosRequestConfig | undefined = err.config;
        const method = cfg?.method?.toUpperCase?.() || 'GET';
        const url = `${cfg?.baseURL || ''}${cfg?.url || ''}`;
        const status = err.response?.status ?? 'ERR';
        logEvent(`HTTP ${status} ${method} ${url}`);
        return Promise.reject(err);
    }
);