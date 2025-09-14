// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        console.clear();
        sessionStorage.clear();
    }
});

import { API_URL_AUTHORIZATION } from './config.js';
import { MessageText } from '../messageBox.js';

const messages = {
  loginSuccess: "Успішний вхід!",
  loginError: "Помилка: невірний логін чи пароль.",
  fieldsEmpty: "Будь ласка, заповніть всі поля.",
  passwordMismatch: "Паролі не співпадають або поле порожнє.",
  passwordUpdateSuccess: "Пароль успішно оновлено!",
  passwordUpdateError: "Не вдалося оновити пароль.",
};
function errorButton(){
    const inputOne = document.querySelector('#lastName');
    const inputTwo = document.querySelector('#password');
    const button = document.querySelector('#loginButton');
    inputOne.classList.add('error');
    inputTwo.classList.add('error');
    button.classList.remove('loginButton');
    setTimeout(() => {
        inputOne.classList.remove('error');
        inputTwo.classList.remove('error');
        button.classList.add('loginButton');
    }, 1000);
}

const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');

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

const form = document.getElementById('loginForm');
const passwordField = document.getElementById('password');
const newPasswordField = document.getElementById('newPassword');
const confirmNewPasswordField = document.getElementById('confirmNewPassword');
const newPasswordFieldsContainer = document.getElementById('newPasswordFields');

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
            showPasswordUpdateForm(data.message);
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
            hidePasswordUpdateForm(data.message);
            MessageText(messages.passwordUpdateSuccess);
        } else {
            MessageText("Помилка: " + (data.message || messages.passwordUpdateError));
        }
    } catch (error) {
        console.log("Помилка: " + error.message);
    } finally {
        setButtonState(false);
    }
}

function showPasswordUpdateForm(message) {
    passwordField.classList.add('hidden');
    newPasswordFieldsContainer.classList.remove('hidden');
    newPasswordFieldsContainer.classList.add('active');
    setButtonState(false, "Зберегти");
    console.log(message);
    newPasswordField.disabled = false;
    confirmNewPasswordField.disabled = false;
    newPasswordField.focus();
}

function hidePasswordUpdateForm(message) {
    passwordField.classList.remove('hidden');
    newPasswordFieldsContainer.classList.add('hidden');
    newPasswordFieldsContainer.classList.remove('active');
    setButtonState(false, "Увійти");
    console.log(message);
    newPasswordField.disabled = true;
    confirmNewPasswordField.disabled = true;
    newPasswordField.value = '';
    confirmNewPasswordField.value = '';
    passwordField.value = '';
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












