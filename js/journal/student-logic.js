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

const role = "student";
const lastName = sessionStorage.getItem("lastName");
const firstName = sessionStorage.getItem("firstName");
const classOrSubject = sessionStorage.getItem("classOrsubject");
const dataCache = {};

export const initStudentLogic = async () => {
    setupMainDropdown('student', "Виберіть предмет", async (subject, teacherLastName) => {
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
            showJournalMessage("Сталася помилка. Спробуйте перезавантажити сторінку.");
        }
    });

    await loadDropdownOptions();
    toggleSubjectTeacherDropdown(false);
    setupGlobalDropdownClose();
};

const loadDropdownOptions = async () => {
    const listElement = document.getElementById("Subject");
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
        const data = await loadDropdownOptionsData(lastName, classOrSubject);
        dataCache[cacheKey] = data;
        populateDropdown(listElement, data);
    } catch (error) {
        console.error("Сталася помилка при завантаженні даних:", error);
        listElement.innerHTML = "<li>Помилка завантаження</li>";
    }
};