// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
export const API_URL_AUTHORIZATION = "https://worker-refuge.i087.workers.dev/";
export const API_URL_SCHEDULE = "https://worker-refuge.i087.workers.dev/";
export const API_URL_UPDATE_GRADE = "https://worker-update-grade.i0871601.workers.dev/";
export const API_URL_FULL_JOURNAL = "https://worker-refuge.i087.workers.dev/";
export const API_URL_ADD_LESSON = "https://worker-add-lesson.i0871601.workers.dev/";
export const API_URL_GRADES_JOURNAL = "https://worker-class-subject.i0871601.workers.dev/";
export const API_URL_STUDENT_JOURNAL = "https://worker-refuge.i087.workers.dev/";

export function getUserData() {
    try {
        const sessionData = sessionStorage.getItem('userBase');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        console.error("Помилка при парсингу даних сесії:", error);
        return null;
    }
}

export async function request(url, payload) {
    const userData = getUserData();
    console.log("Лог 5: Дані користувача:", userData, "Дані для відправки:", payload);
    
    if (!userData) {
        // Викидаємо помилку замість повернення об'єкта.
        throw new Error("Дані користувача не знайдено в сесії. Відправка запиту неможлива.");
    }

    const finalPayload = {
        ...payload,
        userData: userData
    };
    
    console.log("Лог 6: Фінальний об'єкт для відправки:", finalPayload);
    try {
        const response = await fetch(url, {
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






