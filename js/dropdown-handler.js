/**
 * Універсальна функція для заповнення випадаючого списку.
 * @param {HTMLElement} listElement - Елемент <ul> для заповнення.
 * @param {Array|Object} data - Дані для списку.
 * @param {string} type - Тип даних ("subjects", "classesBySubject" або "simpleList").
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
        // Видаліть цей блок або змініть його логіку, оскільки для заповнення класів 
        // ви використовуєте тип "simpleList" у `handleTeacherSubjectSelection`
        console.warn("Попередження: Тип 'classesBySubject' не використовується, оскільки класи заповнюються через 'simpleList'.");
    } else if (type === "simpleList") {
        items = data.map(item => ({ text: item, dataset: {} }));
    }

    items.sort((a, b) => a.text.localeCompare(b.text, undefined, { numeric: true, sensitivity: "base" }));

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
 * Колбек-функція, що обробляє вибір предмета вчителем.
 * @param {string} selectedSubject - Вибраний предмет.
 * @param {object} dataset - dataset вибраного елемента.
 * @param {object} userData - Дані користувача.
 */
function handleTeacherSubjectSelection(selectedSubject, dataset, userData) {
    const classListElement = document.getElementById("class-list");
    const classButtonTextElement = document.querySelector("#Class-button p");
    const classContainer = document.getElementById("ClassTeacher");

    if (classListElement && classButtonTextElement && classContainer) {
        classContainer.style.display = 'block';

        // Вибираємо масив класів для вибраного предмета
        const classesForSubject = userData.data.data[selectedSubject] || [];
        
        // Заповнюємо список класів, використовуючи тип "simpleList"
        populateDropdown(classListElement, classesForSubject, "simpleList");
        classButtonTextElement.textContent = "Виберіть клас";
        classListElement.style.display = 'none';
        
        // Налаштовуємо перемикач та кліки для другого списку
        setupToggle(document.getElementById("Class-button"), classListElement);
        setupListSelection(classListElement, classButtonTextElement, (className, classDataset) => {
            console.log(`Вибраний клас: ${className}`);
        });
    }
}

/**
 * Ініціалізує та заповнює випадаючі списки на основі ролі користувача.
 * @param {object} userData - Об'єкт даних користувача.
 */
export function initDropdown(userData) {
    if (!userData || !userData.data) {
        console.error("Помилка: Неповні дані користувача для ініціалізації випадаючого списку.");
        return;
    }

    const { role } = userData;

    if (role === 'student') {
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            populateDropdown(listElement, userData.data.data, "subjects");
            setupToggle(buttonElement, listElement);
            setupListSelection(listElement, buttonTextElement, (subject, dataset) => {
                console.log(`Вибраний предмет: ${subject}`);
            });
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
            const subjects = Object.keys(userData.data.data).map(s => ({ subject: s }));
            populateDropdown(listElement, subjects, "subjects");
            setupToggle(buttonElement, listElement);
            setupListSelection(listElement, buttonTextElement, (selectedSubject, dataset) => {
                handleTeacherSubjectSelection(selectedSubject, dataset, userData);
            });
            console.log("✅ Список предметів для вчителя заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів вчителя.");
        }
    }
}
