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
    
    buttonElement.addEventListener('click', (event) => {
        event.stopPropagation();
        listElement.style.display = listElement.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', (event) => {
        if (!buttonElement.contains(event.target) && !listElement.contains(event.target)) {
            listElement.style.display = 'none';
        }
    });
}

/**
 * Встановлює обробник подій для елементів списку.
 * @param {HTMLElement} listElement - Елемент <ul>.
 * @param {HTMLElement} buttonTextElement - Елемент <p> в кнопці.
 * @param {Function} onSelectCallback - Колбек-функція, яка викликається після вибору.
 * @param {string} role - Роль користувача.
 * @param {object} userData - Дані користувача.
 */
function setupListSelection(listElement, buttonTextElement, onSelectCallback, role, userData) {
    listElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const selectedText = event.target.textContent;
            buttonTextElement.textContent = selectedText;
            listElement.style.display = 'none';
            onSelectCallback(selectedText, event.target.dataset, role, userData);
        }
    });
}

/**
 * Колбек-функція, що обробляє вибір вчителя.
 * @param {string} selectedSubject - Вибраний предмет.
 * @param {object} dataset - dataset вибраного елемента.
 * @param {string} role - Роль користувача.
 * @param {object} userData - Дані користувача.
 */
function handleTeacherSubjectSelection(selectedSubject, dataset, role, userData) {
    if (role === 'teacher' && userData.data.type === 'classesBySubject') {
        const classListElement = document.getElementById("class-list");
        const classButtonTextElement = document.querySelector("#Class-button p");
        const classContainer = document.getElementById("ClassTeacher");

        if (classListElement && classButtonTextElement && classContainer) {
            // Робимо контейнер видимим
            classContainer.style.display = 'block';

            // Заповнюємо список класів
            const classesForSubject = userData.data.data[selectedSubject] || [];
            populateDropdown(classListElement, classesForSubject.map(c => ({ text: c })), "classesBySubject");
            classButtonTextElement.textContent = "Виберіть клас";

            // Робимо список класів видимим, оскільки він має бути прихованим за замовчуванням
            classListElement.style.display = 'block';
            
            // Налаштовуємо кліки для другого списку
            setupListSelection(classListElement, classButtonTextElement, (className, classDataset) => {
                console.log(`Вибраний клас: ${className}`);
            }, 'teacher', userData);
        }
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

    const { role, data } = userData;

    if (role === 'student') {
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");
        
        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            populateDropdown(listElement, data.data, data.type);
            setupToggle(buttonElement, listElement);
            setupListSelection(listElement, buttonTextElement, (subject, dataset) => {
                console.log(`Вибраний предмет: ${subject}`);
            }, role, userData);
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
            setupListSelection(listElement, buttonTextElement, handleTeacherSubjectSelection, role, userData);
            console.log("✅ Список предметів для вчителя заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів вчителя.");
        }
    }
}
