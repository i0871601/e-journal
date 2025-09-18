// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
export const API_URL_AUTHORIZATION = "https://worker-refuge.i087.workers.dev/";
export const API_URL = "https://worker-refuge.i087.workers.dev/";

export const messages = {
  loginError: {status: 'error', text: "Помилка: невірний логін чи пароль."},
  fieldsEmpty: {status: 'error', text: "Будь ласка, заповніть всі поля."},
  passwordMismatch: {status: 'error', text: "Паролі не співпадають або поле порожнє."},
  passwordUpdateSuccess: {status: 'success', text: "Пароль успішно оновлено!"},
  passwordUpdateError: {status: 'error', text: "Не вдалося оновити пароль."}
};

export function getUserData() {
    try {
        const sessionData = sessionStorage.getItem('userBase');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        console.error("Помилка при парсингу даних сесії:", error);
        return null;
    }
}

export async function request(payload) {
    const userData = getUserData();
    if (!userData) { throw new Error("Дані користувача не знайдено в сесії. Відправка запиту неможлива."); }
    const finalPayload = {
        ...payload,
        userData: userData
    };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Помилка відправки запиту:", error);
        return { success: false, message: error.message };
    }
}









