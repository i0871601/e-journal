// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request } from './config.js';

export const setupAddLessonForm = (selectedSubject, selectedClass, students, refreshJournalCallback) => {
    const contentContainer = document.getElementById("GradeOfJournal");
    if (document.getElementById("add-lesson-form")) {
        return;
    }
    if (!contentContainer) return;

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

            // ⭐️ Логіка для визначення номеру уроку
            let newLessonNumber = 1;
            if (students && students.length > 0 && students[0].grades) {
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
            console.log("Значення 'students' перед викликом .map():", students);
            // Формуємо об'єкт з порожніми оцінками для всіх учнів класу
            const gradesData = students.map((student) => ({
                studentFirstName: student.firstName,
                studentLastName: student.lastName,
                grade: ""
            }));

            const payload = {
                action: 'addLesson',
                subject: selectedSubject,
                className: selectedClass,
                lesson: {
                    Date: lessonDateInput.value,
                    Topic: lessonTopicInput.value,
                    lessonType: lessonType,
                    lessonNumber: newLessonNumber, // ⭐️ Додали номер уроку
                    grades: gradesData
                }
            };

            try {
                const response = await request(payload);
                if (response.success) {
                    alert("Урок успішно додано!");
                    // Очищаємо форму
                    lessonDateInput.value = "";
                    lessonTopicInput.value = "";
                    lessonTypePara.textContent = "Виберіть тип уроку";
                    const selected = document.querySelector('#lessonTypeList li.selected');
                    if (selected) { selected.classList.remove('selected'); }
                    
                    // Оновлюємо журнал
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
