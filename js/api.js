// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { API_URL_AUTHORIZATION } from '../config.js';

export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function authorizeUser(lastName, passwordHash) {
    const response = await fetch(API_URL_AUTHORIZATION, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lastName, password: passwordHash })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Помилка авторизації.');
    }
    return data;
}

export async function updatePassword(lastName, newPasswordHash) {
    const response = await fetch(API_URL_AUTHORIZATION, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lastName, newPassword: newPasswordHash })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Помилка оновлення пароля.');
    }
    return data;
}






