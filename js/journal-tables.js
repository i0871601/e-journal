// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
//))) Цей файл відповідає за відображення журналу та обробку подій оновлення оцінок.

export function displayGrades(grades, role, name) {
    const tableContainer = document.querySelector(".TabletJournal");
    if (!tableContainer) {
        console.error("Елемент з класом '.TabletJournal' не знайдено.");
        return;
    }
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Предмет</th>`;

    // ⭐️ Змінено: використовуємо 'Subject' з великої літери
    const lessons = grades.reduce((acc, current) => {
        if (!acc.find(item => item.lessonNumber === current.lessonNumber)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => a.lessonNumber - b.lessonNumber);

    lessons.forEach(lesson => {
        // ⭐️ Змінено: використовуємо lesson.LessonTopic та lesson.LessonDate, якщо вони існують
        const topic = lesson.LessonTopic || ''; 
        const date = lesson.LessonDate || '';
        headerRow.innerHTML += `<th><p class="lesson-topic">${topic}</p><p class="lesson-date">${date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    // ⭐️ Змінено: використовуємо 'Subject' з великої літери
    const subjects = [...new Set(grades.map(g => g.Subject))];

    subjects.forEach(subject => {
        const subjectRow = document.createElement('tr');
        subjectRow.innerHTML = `<td>${subject}</td>`;

        // ⭐️ Змінено: використовуємо 'Subject' з великої літери
        const subjectGrades = grades.filter(g => g.Subject === subject);
        lessons.forEach(lesson => {
            const grade = subjectGrades.find(g => g.lessonNumber === lesson.lessonNumber);
            // ⭐️ Змінено: використовуємо 'Grade' з великої літери
            const gradeValue = grade ? grade.Grade : '';
            subjectRow.innerHTML += `<td>${gradeValue}</td>`;
        });
        tableBody.appendChild(subjectRow);
    });

    table.appendChild(tableBody);
    tableContainer.appendChild(table);
}

export function displayFullJournal(journalData, updateGradeCallback) {
    const journalContainer = document.getElementById("GradeOfJournal");
    if (!journalContainer) {
        console.error("Елемент 'GradeOfJournal' не знайдено.");
        return;
    }
    const tableContainer = document.querySelector(".TabletJournal");
    if (!tableContainer) {
        console.error("Елемент з класом '.TabletJournal' не знайдено.");
        return;
    }

    let tableWrapper = document.getElementById('journal-table-wrapper');
    if (!tableWrapper) {
        tableWrapper = document.createElement('div');
        tableWrapper.id = 'journal-table-wrapper';
        tableContainer.appendChild(tableWrapper);
    }
    tableWrapper.innerHTML = '';

    if (journalData.length === 0) {
        tableWrapper.innerHTML = '<p>Журнал пустий. Додайте перший урок.</p>';
        return;
    }

    const students = journalData;

    // ✅ Оновлена логіка: збираємо всі унікальні уроки з усіх студентів
    const allLessons = students.flatMap(s => s.grades || []); 
    
    // ✅ Новий підхід для визначення унікальних уроків. 
    const uniqueLessons = allLessons.reduce((acc, current) => {
        if (!acc.find(item => item.lessonNumber === current.lessonNumber)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => parseInt(a.lessonNumber) - parseInt(b.lessonNumber));

    // Створення елементів таблиці
    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Прізвище та Ім'я</th>`;
    uniqueLessons.forEach(lesson => {
        // ⭐️ Змінено: використовуємо lesson.LessonTopic та lesson.LessonDate
        const topic = lesson.LessonTopic || ''; 
        const date = lesson.LessonDate || '';
        headerRow.innerHTML += `<th><p class="lesson-topic">${topic}</p><p class="lesson-date">${date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    students.forEach(student => {
        const studentRow = document.createElement('tr');
        studentRow.innerHTML = `<td>${student.lastName} ${student.firstName}</td>`;
        
        // ✅ Оновлена логіка: для кожного унікального уроку шукаємо відповідну оцінку студента
        const gradeCells = uniqueLessons.map(lesson => {
            const studentGrade = student.grades.find(g => g.lessonNumber === lesson.lessonNumber);
            // ⭐️ Змінено: використовуємо 'Grade' з великої літери
            const gradeValue = studentGrade ? studentGrade.Grade : '';
            return `
                <td
                    class="grade-cell"
                    data-lesson-number="${lesson.lessonNumber}"
                    data-lesson-type="${lesson.lessonType}"
                    data-student-first-name="${student.firstName}"
                    data-student-last-name="${student.lastName}"
                >
                    <input type="text" value="${gradeValue}" class="grade-input" />
                </td>
            `;
        }).join('');
        studentRow.innerHTML += gradeCells;
        tableBody.appendChild(studentRow);
    });
    table.appendChild(tableBody);

    tableWrapper.appendChild(table);

    // Обробник подій для всіх полів оцінок
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('change', (event) => {
            const newValue = event.target.value;
            const parentCell = event.target.closest('.grade-cell');

            if (parentCell) {
                const lessonNumber = parentCell.dataset.lessonNumber;
                const lessonType = parentCell.dataset.lessonType;
                const studentFirstName = parentCell.dataset.studentFirstName;
                const studentLastName = parentCell.dataset.studentLastName;

                updateGradeCallback(newValue, lessonNumber, studentFirstName, studentLastName, lessonType);
            }
        });
    });
}
