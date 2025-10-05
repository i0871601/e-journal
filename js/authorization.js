// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { API_URL_AUTHORIZATION, messages } from './config.js';
import { MessageText } from '../messageBox.js';

//Всі html об'єкти для скрипта
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');
const form = document.getElementById('loginForm');
const passwordField = document.getElementById('password');
const newPasswordField = document.getElementById('newPassword');
const confirmNewPasswordField = document.getElementById('confirmNewPassword');
const newPasswordFieldsContainer = document.getElementById('newPasswordFields');

function errorButton(){
    button.style.pointerEvents = 'none';
    setTimeout(() => {
        button.style.pointerEvents = 'auto';
    }, 1000);
}

export function setButtonState(isLoading, text = "Увійти") {
    if (isLoading) {
        defaultText.classList.add('hidden');
        dots.classList.remove('hidden');
        button.disabled = true;
        button.classList.add('active-animation');
    } else {
        defaultText.classList.remove('hidden');
        dots.classList.add('hidden');
        button.disabled = false;
        defaultText.textContent = text;
        button.classList.remove('active-animation');
    }
}

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
        body: JSON.stringify({
            action: 'login',
            lastName: lastName,
            password: passwordHash
        })
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
        body: JSON.stringify({
            action: 'login',
            lastName: lastName,
            newPassword: newPasswordHash
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Помилка оновлення пароля.');
    }
    return data;
}

function handleFormSubmission(event) {
    event.preventDefault();
    setButtonState(true);

    const lastName = document.getElementById('lastName').value.trim();
    const password = passwordField.value.trim();
    const isUpdatingPassword = newPasswordFieldsContainer.classList.contains('active');

    if (isUpdatingPassword) {
        handlePasswordUpdate(lastName);
    } else {
        handleLogin(lastName, password);
    }
}

async function handleLogin(lastName, password) {
    if (!lastName || !password) {
        errorButton()
        MessageText(messages.fieldsEmpty);
        setButtonState(false);
        return;
    }
    
    try {
        const hashedPassword = await hashPassword(password);
        const data = await authorizeUser(lastName, hashedPassword);

        if (data.tempPasswordRequired) {
            passwordField.classList.add('hidden');
            newPasswordFieldsContainer.classList.remove('hidden');
            newPasswordFieldsContainer.classList.add('active');
            setButtonState(false, "Зберегти");
            newPasswordField.disabled = false;
            confirmNewPasswordField.disabled = false;
            newPasswordField.focus();
            MessageText(messages.newPassword);
        } else {
            saveSessionData(data);
            window.location.href = "Home.html";
        }
    } catch (error) {
        MessageText(messages.loginError);
    } finally {
        setButtonState(false);
    }
}

async function handlePasswordUpdate(lastName) {
    const newPassword = newPasswordField.value.trim();
    const confirmNewPassword = confirmNewPasswordField.value.trim();

    if (!newPassword || newPassword !== confirmNewPassword) {
        MessageText(messages.passwordMismatch);
        setButtonState(false);
        return;
    }
    
    try {
        const hashedNewPassword = await hashPassword(newPassword);
        const data = await updatePassword(lastName, hashedNewPassword);
        
        if (data.isPasswordUpdated) {
            passwordField.classList.remove('hidden');
            newPasswordFieldsContainer.classList.add('hidden');
            newPasswordFieldsContainer.classList.remove('active');
            setButtonState(false, "Увійти");
            newPasswordField.disabled = true;
            confirmNewPasswordField.disabled = true;
            newPasswordField.value = '';
            confirmNewPasswordField.value = '';
            passwordField.value = '';
            MessageText(messages.passwordUpdateSuccess);
        } else {
            MessageText(messages.passwordUpdateError);
        }
    } catch (error) {
        console.log("Помилка: " + error.message);
    } finally {
        setButtonState(false);
    }
}

function saveSessionData(data) {
    const jsonString = JSON.stringify(data);
    sessionStorage.setItem('userBase', jsonString);
}

export function initAuth() {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            sessionStorage.clear();
            const form = document.getElementById('loginForm');
            form.reset();
        }
    });

    form.addEventListener('submit', handleFormSubmission);
}

document.addEventListener('DOMContentLoaded', initAuth);