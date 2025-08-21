// Код виконується відразу після завантаження скрипта
document.getElementById('Journal').style.display = 'block';
console.log('Блок журнал активний');

// Отримуємо посилання на DOM-елементи один раз
const selectElement = document.getElementById('class');
const journalContent = document.getElementById('class-content');
const addLessonForm = document.getElementById('add-lesson-form');
const saveLessonButton = document.getElementById('saveLessonButton');
const lessonNumberInput = document.getElementById('lessonNumberInput');
const lessonDateInput = document.getElementById('lessonDateInput');
const lessonTopicInput = document.getElementById('lessonTopicInput');

// Нові елементи для вибору типу уроку
const lessonTypeInput = document.getElementById('lessonTypeInput');

// Зчитуємо дані з sessionStorage
const teacherLastName = sessionStorage.getItem('lastName');
const teacherSubject = sessionStorage.getItem('classOrsubject');

// Глобальна змінна для збереження списку учнів
let currentStudents = [];

// Функція для відправки запиту на оновлення або додавання оцінки
const updateOrAddGrade = async (gradeData) => {
    const url = `https://worker-update-grade.i0871601.workers.dev/`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gradeData)
        });

        if (res.ok) {
            console.log('Оцінку успішно збережено!');
        } else if (res.status === 403) {
            alert('Зміни можна вносити лише в останній урок.');
            loadFullJournal(selectElement.value);
        } else {
            console.error('Помилка при збереженні оцінки.');
        }
    } catch (e) {
        console.error('Помилка запиту:', e);
    }
};

// Функція для відображення класів у вигляді випадаючого списку
const displayClassesAsDropdown = (classes) => {
    selectElement.innerHTML = '';
    
    if (classes.length === 0) {
        const noClassesOption = document.createElement('option');
        noClassesOption.value = '';
        noClassesOption.textContent = 'Класів ще немає';
        noClassesOption.disabled = true;
        noClassesOption.selected = true;
        selectElement.appendChild(noClassesOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Оберіть клас';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        classes.forEach(cls => {
            const optionElement = document.createElement('option');
            optionElement.value = cls;
            optionElement.textContent = cls;
            selectElement.appendChild(optionElement);
        });
    }
};

// Функція для відображення повного журналу у вигляді таблиці
const displayFullJournal = (journalData) => {
    journalContent.innerHTML = '';
    
    if (journalData.length === 0) {
        journalContent.textContent = 'У цьому класі немає учнів.';
        addLessonForm.style.display = 'none';
        return;
    }
    
    currentStudents = journalData.map(student => ({
        firstName: student.firstName,
        lastName: student.lastName,
    }));
    
    // Збираємо унікальні заголовки уроків, використовуючи Map для уникнення дублікатів
    const lessonsMap = new Map();
    journalData.forEach(student => {
        student.grades.forEach(grade => {
            if (!lessonsMap.has(grade.lessonNumber)) {
                lessonsMap.set(grade.lessonNumber, {
                    lessonNumber: grade.lessonNumber,
                    Date: grade.Date,
                    Topic: grade.Topic,
                    lessonType: grade.lessonType
                });
            }
        });
    });
    
    const lessons = Array.from(lessonsMap.values()).sort((a, b) => a.lessonNumber - b.lessonNumber);

    const maxLessonNumber = lessons.length > 0 ? Math.max(...lessons.map(l => l.lessonNumber)) : 0;

    const table = document.createElement('table');
    table.classList.add('journal-table');

    // Створюємо заголовок таблиці
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Прізвище та Ім\'я';
    headerRow.appendChild(nameHeader);
    
    // Додаємо заголовки для кожного уроку
    lessons.forEach(lesson => {
        const lessonHeader = document.createElement('th');
        let headerText = '';

        if (lesson.lessonType === 'Thematic') {
            headerText = 'Тема';
        } else if (lesson.lessonType === 'Semester') {
            headerText = 'Сем';
        } else if (lesson.lessonType === 'Final') {
            headerText = 'Річн';
        } else {
            headerText = `Урок ${lesson.lessonNumber}`; 
        }

        lessonHeader.innerHTML = `${headerText}<br><span class="lesson-date">${lesson.Date}</span>`;
        lessonHeader.dataset.topic = lesson.Topic;

        const dateSpan = lessonHeader.querySelector('.lesson-date');
        if (dateSpan) {
            dateSpan.style.cursor = 'pointer';
            dateSpan.addEventListener('click', () => {
                alert(`Тема уроку ${lesson.lessonNumber}: ${lesson.Topic}`);
            });
        }
        headerRow.appendChild(lessonHeader);
    });

    // Заповнюємо таблицю даними
    const tableBody = table.createTBody();
    journalData.forEach(student => {
        const studentRow = tableBody.insertRow();
        const studentNameCell = studentRow.insertCell();
        studentNameCell.textContent = `${student.lastName} ${student.firstName}`;
        
        lessons.forEach(lesson => {
            const gradeCell = studentRow.insertCell();
            const grade = student.grades.find(g => g.lessonNumber === lesson.lessonNumber);
            
            const gradeValue = grade ? grade.Grade : '';
            const gradeType = grade ? grade.lessonType : 'Normal';
            
            // Якщо це не звичайна оцінка, або не останній урок, то робимо поле нередагованим
            if (gradeType !== 'Normal' || lesson.lessonNumber !== maxLessonNumber) {
                const gradeSpan = document.createElement('span');
                gradeSpan.textContent = gradeValue;
                if (gradeType !== 'Normal') {
                    gradeSpan.classList.add('calculated-grade');
                }
                gradeCell.appendChild(gradeSpan);
            } else {
                const gradeInput = document.createElement('input');
                gradeInput.type = 'text';
                gradeInput.value = gradeValue;
                gradeInput.dataset.studentFirstName = student.firstName;
                gradeInput.dataset.studentLastName = student.lastName;
                gradeInput.dataset.lessonNumber = lesson.lessonNumber;
                gradeInput.classList.add('grade-input-cell');
                
                gradeInput.addEventListener('change', () => {
                    const updatedGrade = gradeInput.value.trim();
                    const lessonNumber = gradeInput.dataset.lessonNumber;
                    const studentFirstName = gradeInput.dataset.studentFirstName;
                    const studentLastName = gradeInput.dataset.studentLastName;
                    
                    const gradeData = {
                        lessonNumber: lessonNumber,
                        studentFirstName: studentFirstName,
                        studentLastName: studentLastName,
                        teacherLastName: teacherLastName,
                        subject: teacherSubject,
                        grade: updatedGrade,
                        lessonType: 'Normal'
                    };
                    updateOrAddGrade(gradeData);
                });
                
                gradeCell.appendChild(gradeInput);
            }
        });
    });
    journalContent.appendChild(table);
    // *** ОНОВЛЕНА ЛОГІКА ДЛЯ РІЧНОЇ ОЦІНКИ ***
    const hasFinalGrade = lessons.some(lesson => lesson.lessonType === 'Final');
    if (hasFinalGrade) {
        addLessonForm.style.display = 'none';
    } else {
        addLessonForm.style.display = 'block';
    }
};

// Функція для завантаження повного журналу за класом
const loadFullJournal = async (className) => {
    journalContent.innerHTML = 'Завантаження журналу...';
    if (!className) {
        console.error('Клас не вибрано.');
        journalContent.innerHTML = '';
        return;
    }
    const url = `https://worker-full-journal.i0871601.workers.dev/?class=${className}&teacherLastName=${teacherLastName}&teacherSubject=${teacherSubject}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Помилка мережі: ${res.status}`);
            journalContent.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
            addLessonForm.style.display = 'none';
            return;
        }
        const journal = await res.json();
        displayFullJournal(journal);
    } catch (err) {
        console.error('Помилка запиту:', err);
        journalContent.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
        addLessonForm.style.display = 'none';
    }
};

// Функція для відправки даних на воркер для додавання нового уроку
const addLesson = async (lessonData) => {
    const url = `https://worker-add-lesson.i0871601.workers.dev/`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        if (res.ok) {
            alert('Урок успішно додано!');
            loadFullJournal(selectElement.value);
            return true;
        } else {
            alert('Помилка при додаванні уроку.');
            return false;
        }
    } catch (e) {
        console.error('Помилка запиту:', e);
        alert('Помилка при додаванні уроку.');
        return false;
    }
};

// Обробник подій для кнопки "Зберегти урок"
if (saveLessonButton) {
    saveLessonButton.addEventListener('click', async () => {
        const selectedClass = selectElement.value;
        const lessonNumber = lessonNumberInput.value;
        const lessonDate = lessonDateInput.value;
        const lessonTopic = lessonTopicInput.value;
        const lessonType = lessonTypeInput.value;
        
        if (!lessonNumber || !lessonDate || !lessonTopic || !selectedClass || !lessonType) {
            alert('Будь ласка, заповніть всі поля.');
            return;
        }
        const gradesData = currentStudents.map(student => ({
            studentFirstName: student.firstName,
            studentLastName: student.lastName,
            grade: ''
        }));
        const lessonData = {
            lessonNumber, Date: lessonDate, Topic: lessonTopic,
            teacherLastName, teacherSubject,
            class: selectedClass, grades: gradesData,
            lessonType: lessonType
        };
        const success = await addLesson(lessonData);
        if (success) {
            lessonNumberInput.value = '';
            lessonDateInput.value = '';
            lessonTopicInput.value = '';
            lessonTypeInput.value = 'Normal';
        }
    });
}

// Функція для завантаження класів вчителя
const loadTeacherClasses = async () => {
    if (!teacherLastName || !teacherSubject) {
        console.error('Відсутні дані вчителя в localStorage.');
        displayClassesAsDropdown([]);
        return;
    }
    const url = `https://worker-teacher-classes.i0871601.workers.dev/?lastName=${teacherLastName}&subject=${teacherSubject}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Помилка мережі: ${res.status}`);
            displayClassesAsDropdown([]);
            return;
        }
        const data = await res.json();
        const classes = data.classes;
        classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        displayClassesAsDropdown(classes);
    } catch (err) {
        console.error('Помилка запиту:', err);
        displayClassesAsDropdown([]);
    }
};

// Запускаємо основну функцію
loadTeacherClasses();

// Обробник подій для випадаючого списку
selectElement.addEventListener('change', (event) => {
    const selectedClass = event.target.value;
    if (selectedClass) {
        loadFullJournal(selectedClass);
    }
});