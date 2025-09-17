// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request } from './config.js';
import { /*closeAllDropdowns,*/ toggleDropdown } from './dropdown-handler.js'; 

export const setupAddLessonForm = (selectedSubject, selectedClass, journalData, refreshJournalCallback) => {
    const contentContainer = document.getElementById("add-grade-content");
    const existingForm = document.getElementById("add-lesson-form");
    if (existingForm) {
        existingForm.remove();
    }

    if (!contentContainer) {
        console.error("Елемент 'GradeOfJournal' не знайдено.");
        return;
    }

    const students = journalData.students;
    const lessons = journalData.lessons;

    const finalGradeExists = lessons.some(lesson => lesson.lessonType === 'Final');
    if (finalGradeExists) {
        return;
    }

    const addLessonFormHTML = `
    <div id="add-lesson-form">
        <input type="text" id="lessonDateInput" placeholder="Дата (дд.мм.рррр)" required>
        <input type="text" id="lessonTopicInput" placeholder="Тема уроку" required>
        <div id="lessonTypeInput" class="container-all">
            <div id="lessonType-Button" class="dropdown-button">
                <p>Виберіть тип уроку</p>
                <div class="arrow-down"></div>
            </div>
            <ul id="lessonTypeList" class="dropdown-list">
                <li data-type="Normal">Звичайний</li>
                <li data-type="Thematic">Тематична</li>
                <li data-type="Semester">Семестрова</li>
                <li data-type="Final">Річна</li>
            </ul>
        </div>
        <button id="saveLessonButton">Зберегти урок</button>
    </div>`;
    contentContainer.innerHTML += addLessonFormHTML;

    const lessonTypePara = document.getElementById("lessonType-Button").querySelector("p");
    const lessonTypeList = document.getElementById("lessonTypeList");
    const saveLessonButton = document.getElementById("saveLessonButton");
    const lessonTypeButton = document.getElementById("lessonType-Button");
    const lessonTypeInputContainer = document.getElementById("lessonTypeInput"); // Зміни

    lessonTypeList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const allListItems = lessonTypeList.querySelectorAll('li');
            allListItems.forEach(item => item.classList.remove('selected'));
            event.target.classList.add('selected');
            const selectedType = event.target.textContent;
            lessonTypePara.textContent = selectedType;
            lessonTypeList.classList.remove('visible-list');
            
            // Видаляємо клас з батьківського контейнера при виборі елемента
            if (lessonTypeInputContainer) {
                lessonTypeInputContainer.classList.remove('click-button');
            }
        }
    });

    if (lessonTypeButton && lessonTypeList) {
        lessonTypeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(lessonTypeButton, lessonTypeList);
        });
    
        const lessonTypeInputContainer = document.getElementById("lessonTypeInput");
        document.addEventListener('click', (event) => {
            if (!lessonTypeButton.contains(event.target) && !lessonTypeList.contains(event.target)) {
                lessonTypeList.classList.remove('visible-list');
                if (lessonTypeInputContainer) {
                    lessonTypeInputContainer.classList.remove('click-button');
                }
            }
        });
    }

    if (saveLessonButton) {
        saveLessonButton.addEventListener("click", async () => {
            const lessonDateInput = document.getElementById("lessonDateInput");
            const lessonTopicInput = document.getElementById("lessonTopicInput");
            const selectedListItem = document.querySelector('#lessonTypeList li.selected');

            if (!lessonDateInput.value || !lessonTopicInput.value || !selectedListItem) {
                alert("Будь ласка, заповніть всі поля.");
                return;
            }

            const lessonType = selectedListItem.dataset.type;

            if (!students || !Array.isArray(students)) {
                console.error("Помилка: Не вдалося отримати дані учнів.");
                alert("Не вдалося додати урок. Будь ласка, оновіть сторінку і спробуйте знову.");
                return;
            }
            
            let newLessonNumber = 1;
            const maxLessonNumber = lessons && lessons.length > 0
                ? Math.max(...lessons.map(l => parseInt(l.lessonNumber, 10)))
                : 0;

            if (lessonType === "Normal") {
                newLessonNumber = maxLessonNumber + 1;
            } else {
                newLessonNumber = maxLessonNumber;
            }
            
            const gradesData = students.map((student) => ({
                studentFirstName: student.firstName,
                studentLastName: student.lastName,
                grade: ""
            }));

            const payload = {
                action: 'addLesson',
                userData: JSON.parse(sessionStorage.getItem('userData')),
                lesson: {
                    subject: selectedSubject,
                    className: selectedClass,
                    Date: lessonDateInput.value,
                    Topic: lessonTopicInput.value,
                    lessonType: lessonType,
                    lessonNumber: newLessonNumber,
                    grades: gradesData
                }
            };
            
            console.log("Відправка payload на воркер:", payload);
            try {
                const response = await request(payload);
                if (response.success) {
                    alert("Урок успішно додано!");
                    lessonDateInput.value = "";
                    lessonTopicInput.value = "";
                    lessonTypePara.textContent = "Виберіть тип уроку";
                    const selected = document.querySelector('#lessonTypeList li.selected');
                    if (selected) { selected.classList.remove('selected'); }
                    
                    refreshJournalCallback();
                } else {
                    alert("Помилка при додаванні уроку: " + (response.message || "Невідома помилка."));
                }
            } catch (error) {
                console.error("Помилка відправки запиту:", error);
                alert("Не вдалося відправити запит на додавання уроку.");
            }
        });
    }
};
