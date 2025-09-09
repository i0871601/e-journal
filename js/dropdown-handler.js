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
 * Встановлює обробник подій для перемикання видимості списку.
 * @param {HTMLElement} buttonElement - Кнопка, яка перемикає список.
 * @param {HTMLElement} listElement - Елемент списку <ul>.
 */
function setupToggle(buttonElement, listElement) {
    if (!buttonElement || !listElement) {
        console.error("Помилка: Не знайдено кнопку або список для налаштування перемикача.");
        return;
    }
    
    // Перемикаємо display списку при кліку на кнопку
    buttonElement.addEventListener('click', (event) => {
        event.stopPropagation(); // Зупиняємо розповсюдження події, щоб не закрити список одразу
        listElement.style.display = listElement.style.display === 'block' ? 'none' : 'block';
    });
    
    // Закриваємо список при кліку в будь-яке інше місце сторінки
    document.addEventListener('click', (event) => {
        if (!buttonElement.contains(event.target) && !listElement.contains(event.target)) {
            listElement.style.display = 'none';
        }
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
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            populateDropdown(listElement, data.data, data.type);
            setupToggle(buttonElement, listElement);
            console.log("✅ Список предметів для учня заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів учня.");
        }

    } else if (role === 'teacher') {
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            const subjects = userData.classOrsubject.split(',').map(s => s.trim());
            populateDropdown(listElement, subjects.map(s => ({ subject: s, teacherLastName: userData.lastName })), "subjects");
            setupToggle(buttonElement, listElement);
            console.log("✅ Список предметів для вчителя заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів вчителя.");
        }
    }
}
