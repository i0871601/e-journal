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

import { getUserData } from '../config.js';

const userData = getUserData();
if (!userData) {
    showJournalMessage("Будь ласка, увійдіть в систему.");
    console.error("Вчитель Логік Лог 1: Дані користувача не знайдено.");
    throw new Error("Дані користувача не знайдено.");
}

const role = userData.role;
const lastName = userData.lastName;
const firstName = userData.firstName;
let classOrSubject = userData.classOrsubject;
const dataCache = {};
let currentStudents = [];

export const initTeacherLogic = async () => {
    console.log("Вчитель Логік Лог 2: Ініціалізація логіки для вчителя. Дані: ", { role, lastName, firstName, classOrSubject });
    setupMainDropdown('teacher', "Виберіть клас", async (className) => {
        showJournalMessage('Завантаження журналу...');
        const cacheKey = `teacher-${classOrSubject}-${className}`;
        
        if (dataCache[cacheKey]) {
            displayFullJournal(dataCache[cacheKey], handleGradeUpdate);
            return;
        }

        try {
            // ЗМІНА 1: ПЕРЕДАЄМО І КЛАС, І ПРЕДМЕТ
            console.log("Вчитель Логік Лог Х: Відправка запиту на повний журнал. Клас:", className, "Предмет:", classOrSubject);
            const journal = await loadFullJournalData(className, classOrSubject);
            dataCache[cacheKey] = journal;
            currentStudents = journal;
            displayFullJournal(journal, handleGradeUpdate);
        } catch (err) {
            console.error("Помилка завантаження журналу:", err);
            showJournalMessage(err.message || "Не вдалося завантажити журнал. Спробуйте пізніше.");
        }
    });

    setupAddLessonForm(handleLessonAdd);

    if (classOrSubject && classOrSubject.includes(',')) {
        console.log("Вчитель Логік Лог 3: Вчитель викладає кілька предметів. Завантаження опцій.");
        const subjectsArray = classOrSubject.split(',').map(item => item.trim());
        populateDropdown(document.getElementById("subject-list"), { type: 'subjects', data: subjectsArray.map(s => ({ subject: s, teacherLastName: lastName })) });
        
        // Встановлюємо перший предмет і викликаємо завантаження класів для нього
        classOrSubject = subjectsArray[0];
        setSubjectTeacherButtonText(classOrSubject);
        toggleSubjectTeacherDropdown(true);

        const subjectList = document.getElementById("subject-list");
        subjectList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                const selectedSubject = event.target.textContent;
                if (classOrSubject !== selectedSubject) {
                    classOrSubject = selectedSubject;
                    setSubjectTeacherButtonText(classOrSubject);
                    // Викликаємо завантаження класів для нового предмету
                    loadDropdownOptions(selectedSubject);
                }
                subjectList.style.display = "none";
            }
        });
    }

    // Тільки тепер викликаємо loadDropdownOptions() один раз, після того, як classOrSubject вже встановлений
    await loadDropdownOptions(classOrSubject);
    setupGlobalDropdownClose();
};

const handleGradeUpdate = async (dataset, gradeValue) => {
    console.log("Вчитель Логік Лог 4: Спроба оновити оцінку. Дані:", { dataset, gradeValue });
    const updatedGradeData = {
        lessonNumber: dataset.lessonNumber,
        studentFirstName: dataset.studentFirstName,
        studentLastName: dataset.studentLastName,
        subject: classOrSubject,
        grade: gradeValue.trim(),
        lessonType: "Normal"
    };
    const res = await updateOrAddGrade(updatedGradeData);
    if (res.success === false) {
        console.error("Вчитель Логік Лог 5: Помилка при оновленні оцінки:", res.message);
        alert("Зміни можна вносити лише в останній урок.");
        const selectedClass = document.querySelector("#ClassTeacher .first-option p").textContent.trim();
        const cacheKey = `teacher-${classOrSubject}-${selectedClass}`;
        delete dataCache[cacheKey];
        // ЗМІНА 2: ПЕРЕЗАВАНТАЖУЄМО ЖУРНАЛ, ПЕРЕДАЮЧИ І КЛАС, І ПРЕДМЕТ
        console.log("Вчитель Логік Лог Х: Перезавантаження журналу. Клас:", selectedClass, "Предмет:", classOrSubject);
        await loadFullJournalData(selectedClass, classOrSubject);
    } else if (!res.success) {
        
        alert("Помилка при збереженні оцінки.");
    }
};

const handleLessonAdd = async (lessonData) => {
    console.log("Вчитель Логік Лог 7: Спроба додати новий урок. Дані:", lessonData);
    const selectedClass = document.querySelector("#ClassTeacher .first-option p").textContent.trim();
    const currentJournalData = dataCache[`teacher-${classOrSubject}-${selectedClass}`];
    
    // Нова, виправлена логіка для визначення номера уроку
    let newLessonNumber;
    if (currentJournalData && currentJournalData[0] && currentJournalData[0].grades) {
        // Знаходимо найбільший номер уроку серед усіх записів
        const allLessons = currentJournalData[0].grades;
        const maxLessonNumber = allLessons.length > 0 
            ? Math.max(...allLessons.map(g => parseInt(g.lessonNumber, 10)))
            : 0;

        // Збільшуємо номер тільки для "звичайного" уроку
        if (lessonData.lessonType === "Normal") {
            newLessonNumber = maxLessonNumber + 1;
        } else {
            // Для підсумкових уроків використовуємо номер останнього уроку
            newLessonNumber = maxLessonNumber;
        }
    } else {
        // Якщо даних немає, це перший урок, тож номер 1.
        newLessonNumber = 1;
    }

    const gradesData = currentStudents.map((student) => ({
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        grade: ""
    }));

    const fullLessonData = {
        ...lessonData,
        lessonNumber: newLessonNumber,
        teacherSubject: classOrSubject,
        class: selectedClass,
        grades: gradesData
    };

    const res = await addLessonToJournal(fullLessonData);
    if (res.success) {
        console.log("Вчитель Логік Лог 8: Урок успішно додано.");
        alert("Урок успішно додано!");
        const cacheKey = `teacher-${classOrSubject}-${selectedClass}`;
        delete dataCache[cacheKey];
        const journal = await loadFullJournalData(selectedClass, classOrSubject);
        dataCache[cacheKey] = journal;
        displayFullJournal(journal, handleGradeUpdate);
        return true;
    } else {
        console.error("Вчитель Логік Лог 9: Помилка при додаванні уроку:", res.message);
        alert("Помилка при додаванні уроку.");
        return false;
    }
};
const loadDropdownOptions = async (subjectToLoad) => {
    console.log("Вчитель Логік Лог 10: Завантаження опцій для випадаючого списку.");
    const listElement = document.getElementById("class-list");
    if (!listElement) {
        console.error("Елемент для випадаючого списку не знайдено.");
        return;
    }
    const cacheKey = `options-${role}-${subjectToLoad}`;
    if (dataCache[cacheKey]) {
        populateDropdown(listElement, dataCache[cacheKey]);
        return;
    }
    try {
        console.log("Вчитель Логік Лог 11: Надсилаємо запит для предмета:", subjectToLoad);
        const data = await loadDropdownOptionsData(subjectToLoad); 
        dataCache[cacheKey] = data;
        populateDropdown(listElement, data);
    } catch (error) {
        console.error("Сталася помилка при завантаженні даних:", error);
        listElement.innerHTML = "<li>Помилка завантаження</li>";
    }
};