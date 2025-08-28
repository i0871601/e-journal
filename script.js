//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const apiURL = "https://worker-home.i0871601.workers.dev/";

const form = document.getElementById('loginForm');
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');
const errorMessage = document.getElementById('errorMessage');

const passwordField = document.getElementById('password');
const newPasswordField = document.getElementById('newPassword');
const confirmNewPasswordField = document.getElementById('confirmNewPassword');
const newPasswordFieldsContainer = document.getElementById('newPasswordFields');

// Функція для керування станом кнопки "Увійти"
function setButtonState(isLoading, text = "Увійти") {
    if (isLoading) {
        defaultText.classList.add('hidden');
        dots.classList.remove('hidden');
        button.disabled = true;
    } else {
        defaultText.classList.remove('hidden');
        dots.classList.add('hidden');
        button.disabled = false;
        defaultText.textContent = text;
    }
}

// Функція для хешування пароля
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
}

// Функція для відправки запиту на авторизацію
async function authorizeUser(lastName, passwordHash) {
    const body = JSON.stringify({
        lastName: lastName,
        password: passwordHash
    });

    const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Помилка авторизації.');
    }
    return data;
}

// Функція для відправки запиту на оновлення пароля
async function updatePassword(lastName, newPasswordHash) {
    const body = JSON.stringify({
        lastName: lastName,
        newPassword: newPasswordHash
    });

    const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Помилка оновлення пароля.');
    }
    return data;
}

// Обробник відправки форми
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const lastName = document.getElementById('lastName').value.trim();
    const password = document.getElementById('password').value.trim();
    const isUpdatingPassword = newPasswordFieldsContainer.classList.contains('active');

    errorMessage.textContent = '';

    if (!lastName) {
        errorMessage.textContent = "Будь ласка, введіть прізвище.";
        return;
    }

    if (isUpdatingPassword) {
        const newPassword = newPasswordField.value.trim();
        const confirmNewPassword = confirmNewPasswordField.value.trim();
        
        if (!newPassword || newPassword !== confirmNewPassword) {
            errorMessage.textContent = "Паролі не співпадають або поле порожнє.";
            return;
        }

        setButtonState(true, "Зберегти");
        let data;
        try {
            const hashedNewPassword = await hashPassword(newPassword);
            data = await updatePassword(lastName, hashedNewPassword);

            if (data.isPasswordUpdated) {
                passwordField.classList.remove('hidden');
                newPasswordFieldsContainer.classList.add('hidden');
                newPasswordFieldsContainer.classList.remove('active');
                setButtonState(false, "Увійти");
                errorMessage.textContent = data.message;
                newPasswordField.disabled = true;
                confirmNewPasswordField.disabled = true;
                
                newPasswordField.value = '';
                confirmNewPasswordField.value = '';
                passwordField.value = '';
            } else {
                errorMessage.textContent = "Помилка: " + data.message;
            }
        } catch (error) {
            errorMessage.textContent = "Помилка: " + error.message;
        } finally {
            if (!data || !data.isPasswordUpdated) {
                setButtonState(false, "Зберегти");
            }
        }
    } else {
        if (!password) {
            errorMessage.textContent = "Будь ласка, введіть пароль.";
            return;
        }
        
        setButtonState(true);
        let data;
        try {
            const hashedPassword = await hashPassword(password);
            data = await authorizeUser(lastName, hashedPassword);

            if (data.tempPasswordRequired) {
                passwordField.classList.add('hidden');
                newPasswordFieldsContainer.classList.remove('hidden');
                newPasswordFieldsContainer.classList.add('active');
                setButtonState(false, "Зберегти");
                errorMessage.textContent = data.message;
                newPasswordField.disabled = false;
                confirmNewPasswordField.disabled = false;
                newPasswordField.focus();
            } else {
                sessionStorage.setItem('role', data.role);
                sessionStorage.setItem('firstName', data.firstName);
                sessionStorage.setItem('lastName', data.lastName);
                if (data.scriptName) {
                    sessionStorage.setItem('scriptName', data.scriptName);
                }
                if (data.classOrsubject) {
                    sessionStorage.setItem('classOrsubject', data.classOrsubject);
                }
                window.location.href = data.redirectUrl;
            }
        } catch (error) {
            errorMessage.textContent = "Помилка: " + error.message;
        } finally {
            if (!isUpdatingPassword) {
                setButtonState(false);
            }
        }
    }
});