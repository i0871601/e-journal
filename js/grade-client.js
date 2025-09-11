// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

export const setupAddLessonForm = () => {
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
        </div>
    `;
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
        saveLessonButton.addEventListener("click", () => {
            const lessonDateInput = document.getElementById("lessonDateInput");
            const lessonTopicInput = document.getElementById("lessonTopicInput");
            const selectedListItem = document.querySelector('#lessonTypeList li.selected');

            if (!lessonDateInput.value || !lessonTopicInput.value || !selectedListItem) {
                alert("Будь ласка, заповніть всі поля.");
                return;
            }

            const lessonType = selectedListItem.dataset.type;
            const lessonData = {
                Date: lessonDateInput.value,
                Topic: lessonTopicInput.value,
                lessonType: lessonType
            };

            lessonDateInput.value = "";
            lessonTopicInput.value = "";
            lessonTypePara.textContent = "Виберіть тип уроку";
            const selected = document.querySelector('#lessonTypeList li.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
        });
    }
};

//export const handleLessonAdd = async (lessonData, currentStudents, classOrSubject, selectedClass) => {
    //console.log("Клієнт Оцінок Лог: Спроба додати новий урок. Дані:", lessonData);
    
    //let newLessonNumber = 1;
    //if (currentStudents && currentStudents.length > 0 && currentStudents[0].grades) {
        // const allLessons = currentStudents[0].grades;
        // const maxLessonNumber = allLessons.length > 0 
           //  ? Math.max(...allLessons.map(g => parseInt(g.lessonNumber, 10)))
           //  : 0;
    
       //  if (lessonData.lessonType === "Normal") {
         //    newLessonNumber = maxLessonNumber + 1;
         //} else {
          //   newLessonNumber = maxLessonNumber;
        // }
    // }
    
    //const gradesData = currentStudents.map((student) => ({
        // studentFirstName: student.firstName,
       //  studentLastName: student.lastName,
       //  grade: ""
    // }));
    
    // const fullLessonData = {
     //    ...lessonData,
      //   lessonNumber: newLessonNumber,
      //   teacherSubject: classOrSubject,
      //   class: selectedClass,
      //   grades: gradesData
    // };
    
    // const res = await addLessonToJournal(fullLessonData);
    // if (res.success) {
     //    alert("Урок успішно додано!");
      //   return true;
     //} else {
     //    alert("Помилка при додаванні уроку.");
     //    return false;
     //}
//};
