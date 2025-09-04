//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import {
    updateOrAddGrade,
    loadFullJournalData,
    addLessonToJournal,
    loadDropdownOptionsData
} from './journal-api.js';

import {
    displayFullJournal,
    setupAddLessonForm,
    populateDropdown,
    showJournalMessage,
    toggleSubjectTeacherDropdown,
    setSubjectTeacherButtonText,
    setupMainDropdown,
    setupGlobalDropdownClose
} from './journal-dom.js';

const role = "teacher";
const lastName = sessionStorage.getItem("lastName");
const firstName = sessionStorage.getItem("firstName");
let classOrSubject = sessionStorage.getItem("classOrsubject");
const dataCache = {};
let currentStudents = [];

export const initTeacherLogic = async () => {
    setupMainDropdown('teacher', "Виберіть клас", async (className) => {
        showJournalMessage('Завантаження журналу...');
        const cacheKey = `teacher-${classOrSubject}-${className}`;
        
        if (dataCache[cacheKey]) {
            displayFullJournal(dataCache[cacheKey], handleGradeUpdate);
            return;
        }

        try {
            const journal = await loadFullJournalData(className, lastName, classOrSubject);
            dataCache[cacheKey] = journal;
            currentStudents = journal;
            displayFullJournal(journal, handleGradeUpdate);
        } catch (err) {
            console.error("Помилка завантаження журналу:", err);
            showJournalMessage("Не вдалося завантажити журнал. Спробуйте пізніше.");
        }
    });

    setupAddLessonForm(handleLessonAdd);

    if (classOrSubject && classOrSubject.includes(',')) {
        const subjectsArray = classOrSubject.split(',').map(item => item.trim());
        populateDropdown(document.getElementById("Subject"), { type: 'subjects', data: subjectsArray.map(s => ({ subject: s, teacherLastName: lastName })) });
        setSubjectTeacherButtonText(subjectsArray[0]);
        classOrSubject = subjectsArray[0];
        toggleSubjectTeacherDropdown(true);

        const subjectList = document.getElementById("Subject");
        subjectList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                const selectedSubject = event.target.textContent;
                if (classOrSubject !== selectedSubject) {
                    classOrSubject = selectedSubject;
                    setSubjectTeacherButtonText(classOrSubject);
                    loadDropdownOptions();
                }
                subjectList.style.display = "none";
            }
        });
    }

    await loadDropdownOptions();
    setupGlobalDropdownClose();
};

const handleGradeUpdate = async (dataset, gradeValue) => {
    const updatedGradeData = {
        lessonNumber: dataset.lessonNumber,
        studentFirstName: dataset.studentFirstName,
        studentLastName: dataset.studentLastName,
        teacherLastName: lastName,
        subject: classOrSubject,
        grade: gradeValue.trim(),
        lessonType: "Normal"
    };
    const res = await updateOrAddGrade(updatedGradeData);
    if (res.status === 403) {
        alert("Зміни можна вносити лише в останній урок.");
        const selectedClass = document.querySelector("#classOfjournal .first-option p").textContent.trim();
        const cacheKey = `teacher-${classOrSubject}-${selectedClass}`;
        delete dataCache[cacheKey];
        await loadFullJournalData(selectedClass, lastName, classOrSubject);
    } else if (!res.ok) {
        alert("Помилка при збереженні оцінки.");
    }
};

const handleLessonAdd = async (lessonData) => {
    const selectedClass = document.querySelector("#classOfjournal .first-option p").textContent.trim();
    const currentJournalData = dataCache[`teacher-${classOrSubject}-${selectedClass}`];
    
    let newLessonNumber;
    if (lessonData.lessonType === "Normal") {
        const normalLessons = currentJournalData ? currentJournalData[0].grades.filter(g => g.lessonType === "Normal") : [];
        const maxNormalNumber = normalLessons.length > 0 ? Math.max(...normalLessons.map(g => parseInt(g.lessonNumber, 10))) : 0;
        newLessonNumber = maxNormalNumber + 1;
    } else {
        const allLessons = currentJournalData ? currentJournalData[0].grades : [];
        const maxLessonNumber = allLessons.length > 0 ? Math.max(...allLessons.map(g => parseInt(g.lessonNumber, 10))) : 0;
        newLessonNumber = maxLessonNumber;
    }
    
    const gradesData = currentStudents.map((student) => ({
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        grade: ""
    }));

    const fullLessonData = {
        ...lessonData,
        lessonNumber: newLessonNumber,
        teacherLastName: lastName,
        teacherSubject: classOrSubject,
        class: selectedClass,
        grades: gradesData
    };

    const res = await addLessonToJournal(fullLessonData);
    if (res.ok) {
        alert("Урок успішно додано!");
        const cacheKey = `teacher-${classOrSubject}-${selectedClass}`;
        delete dataCache[cacheKey];
        const journal = await loadFullJournalData(selectedClass, lastName, classOrSubject);
        dataCache[cacheKey] = journal;
        displayFullJournal(journal, handleGradeUpdate);
        return true;
    } else {
        alert("Помилка при додаванні уроку.");
        return false;
    }
};

const loadDropdownOptions = async () => {
    const listElement = document.getElementById("subjectClass");
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