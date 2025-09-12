// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request } from './config.js';

export const setupAddLessonForm = (selectedSubject, selectedClass, students, refreshJournalCallback) => {
    const contentContainer = document.getElementById("GradeOfJournal");
    const existingForm = document.getElementById("add-lesson-form");
    if (existingForm) {
        existingForm.remove(); // Видаляємо стару форму, щоб створити нову
    }

    if (!contentContainer) {
        console.error("Елемент 'GradeOfJournal' не знайдено.");
        return;
    }
    const allLessons = students.flatMap(s => s.grades || []);
    const finalGradeExists = allLessons.some(lesson => lesson.lessonType === 'Final');

    // Якщо річна оцінка існує, ми не будемо відображати форму
    if (finalGradeExists) {
        // Ми не будемо додавати форму до DOM
        return;
    }

    const addLessonFormHTML = `
    <div id="add-lesson-form">
        <h3>Додати новий урок</h3>
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
    contentContainer.insertAdjacentHTML('afterend', addLessonFormHTML);

    const lessonTypePara = document.getElementById("lessonType-Button").querySelector("p");
    const lessonTypeList = document.getElementById("lessonTypeList");
    const saveLessonButton = document.getElementById("saveLessonButton");
    const lessonTypeButton = document.getElementById("lessonType-Button");

    // ✅ Виправлення: обробники подій для випадаючого списку тепер налаштовуються одразу
    lessonTypeList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const allListItems = lessonTypeList.querySelectorAll('li');
            allListItems.forEach(item => item.classList.remove('selected'));
            event.target.classList.add('selected');
            const selectedType = event.target.textContent;
            lessonTypePara.textContent = selectedType;
            lessonTypeList.style.display = "none";
        }
    });

    if (lessonTypeButton && lessonTypeList) {
        lessonTypeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            lessonTypeList.style.display = lessonTypeList.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (event) => {
            if (!lessonTypeButton.contains(event.target) && !lessonTypeList.contains(event.target)) {
                lessonTypeList.style.display = 'none';
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
                console.error("Помилка: Не вдалося отримати дані учнів. 'students' є undefined або не є масивом.");
                alert("Не вдалося додати урок. Будь ласка, оновіть сторінку і спробуйте знову.");
                return;
            }

            let newLessonNumber = 1;
            if (students.length > 0 && students[0].grades) {
                const allLessons = students[0].grades;
                const maxLessonNumber = allLessons.length > 0
                    ? Math.max(...allLessons.map(g => parseInt(g.lessonNumber, 10)))
                    : 0;

                if (lessonType === "Normal") {
                    newLessonNumber = maxLessonNumber + 1;
                } else {
                    newLessonNumber = maxLessonNumber;
                }
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
