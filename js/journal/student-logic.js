//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import {
    loadDropdownOptionsData,
    loadStudentGradesData
} from './journal-api.js';

import {
    displayGrades,
    populateDropdown,
    showJournalMessage,
    toggleSubjectTeacherDropdown,
    setupMainDropdown,
    setupGlobalDropdownClose
} from './journal-dom.js';

import { getUserData } from '../config.js';

const userData = getUserData();
if (!userData) {
    showJournalMessage("Будь ласка, увійдіть в систему.");
    console.error("Учень Логік Лог 1: Дані користувача не знайдено.");
    throw new Error("Дані користувача не знайдено.");
}

const role = userData.role;
const lastName = userData.lastName;
const firstName = userData.firstName;
const classOrSubject = userData.classOrsubject;
const dataCache = {};

export const initStudentLogic = async () => {
    console.log("Учень Логік Лог 2: Ініціалізація логіки для учня. Дані:", { role, lastName, firstName, classOrSubject });
    const subjectContainer = document.getElementById("Select-Subject");
    const classTeacherContainer = document.getElementById("ClassTeacher");

    if (subjectContainer) {
        subjectContainer.style.display = "block";
    }

    if (classTeacherContainer) {
        classTeacherContainer.style.display = "none";
    }
    setupMainDropdown('student', "Виберіть предмет", async (subject, teacherLastName) => {
        console.log("Учень Логік Лог 3: Вибрано предмет. Завантаження оцінок.");
        showJournalMessage('Завантаження оцінок...');
        const cacheKey = `student-${subject}`;
        
        if (dataCache[cacheKey]) {
            displayGrades(dataCache[cacheKey], role, `${lastName} ${firstName}`);
            return;
        }

        try {
            const gradesData = await loadStudentGradesData({
                studentLastName: lastName,
                studentFirstName: firstName,
                class: classOrSubject,
                subject: subject,
                teacherLastName: teacherLastName
            });
            dataCache[cacheKey] = gradesData.grades;
            displayGrades(gradesData.grades, role, `${lastName} ${firstName}`);
        } catch (err) {
            console.error("Помилка завантаження даних:", err);
            showJournalMessage(err.message || "Сталася помилка. Спробуйте перезавантажити сторінку.");
        }
    });

    await loadDropdownOptions()
    setupGlobalDropdownClose();
};

const loadDropdownOptions = async () => {
    console.log("Учень Логік Лог 4: Завантаження опцій для випадаючого списку.");
    const listElement = document.getElementById("subject-list");
    if (!listElement) {
        console.error("Елемент для випадаючого списку не знайдено.");
        return;
    }
    const cacheKey = `options-${role}-${classOrSubject}`;
    if (dataCache[cacheKey]) {
        populateDropdown(listElement, dataCache[cacheKey]);
        return;
    }
    try {
        const data = await loadDropdownOptionsData();
        dataCache[cacheKey] = data;
        populateDropdown(listElement, data);
    } catch (error) {
        console.error("Сталася помилка при завантаженні даних:", error);
        listElement.innerHTML = "<li>Помилка завантаження</li>";
    }
};