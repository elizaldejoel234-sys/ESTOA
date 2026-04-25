/**
 * Ejemplo de uso de spread operator y desestructuración.
 * Para evitar el error TS2307, ignoramos la resolución de tipos de la URL de ESM.
 */

// @ts-ignore
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

interface UserConfig {
    name: string;
    theme: string;
    notifications: boolean;
}

const defaultConfig: UserConfig = {
    name: 'Guest',
    theme: 'light',
    notifications: true
};

const userUpdate = {
    name: 'Aura User',
    theme: 'dark'
};

const finalConfig: UserConfig = { ...defaultConfig, ...userUpdate };
console.log('Configuración final aplicada:', finalConfig);
