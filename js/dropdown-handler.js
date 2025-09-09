/**
 * Універсальна функція для заповнення випадаючого списку.
 * @param {HTMLElement} listElement - Елемент <ul> для заповнення.
 * @param {Array|Object} data - Дані для списку.
 * @param {string} type - Тип даних ("subjects" або "classesBySubject").
 */
function populateDropdown(listElement, data, type) {
    if (!listElement) {
        console.error("Помилка: Не знайдено елемент списку для заповнення.");
        return;
    }

    listElement.innerHTML = '';

    let items = [];
    if (type === "subjects") {
        items = data.map(item => ({ text: item.subject, dataset: { teacherLastName: item.teacherLastName || "" } }));
    } else if (type === "classesBySubject") {
        for (const subject in data) {
            const classes = data[subject];
            classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
            classes.forEach(className => {
                items.push({ text: className, dataset: { subject: subject } });
            });
        }
    }

    // Загальне сортування для всіх типів, якщо потрібно. Тут не сортуємо,
    // щоб зберегти порядок, якщо він важливий. Можна додати сортування, якщо це потрібно.

    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item.text;
        for (const key in item.dataset) {
            listItem.dataset[key] = item.dataset[key];
        }
        listElement.appendChild(listItem);
    });
}

/**
 * Ініціалізує та заповнює випадаючий список на основі ролі користувача.
 * @param {object} userData - Об'єкт даних користувача.
 */
export function initDropdown(userData) {
    if (!userData || !userData.data) {
        console.error("Помилка: Неповні дані користувача для ініціалізації випадаючого списку.");
        return;
    }

    const { role, data } = userData;

    if (role === 'student') {
        const listElement = document.getElementById("subject-list");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            populateDropdown(listElement, data.data, data.type);
            console.log("✅ Список предметів для учня заповнено.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів учня.");
        }

    } else if (role === 'teacher') {
        const listElement = document.getElementById("subject-list");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            // Ми використовуємо classOrsubject для вчителя як список предметів,
            // а data містить об'єкт з класами. Ми заповнюємо список предметів.
            const subjects = userData.classOrsubject.split(',').map(s => s.trim());
            populateDropdown(listElement, subjects.map(s => ({ subject: s, teacherLastName: userData.lastName })), "subjects");
            console.log("✅ Список предметів для вчителя заповнено.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів вчителя.");
        }
    }
}
