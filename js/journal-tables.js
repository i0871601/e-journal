// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// Цей файл відповідає за відображення журналу та обробку подій оновлення оцінок.

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

    const lessons = grades.reduce((acc, current) => {
        const uniqueId = `${current.lessonNumber}-${current.lessonType}`;
        if (!acc.find(item => `${item.lessonNumber}-${item.lessonType}` === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => {
        const numA = parseInt(a.lessonNumber, 10);
        const numB = parseInt(b.lessonNumber, 10);
        return numA - numB;
    });

    lessons.forEach(lesson => {
        let topicText = lesson.Topic || lesson.lessonType;

        switch (lesson.lessonType) {
            case 'Normal':
                topicText = `Урок ${lesson.lessonNumber}`;
                break;
            case 'Thematic':
                topicText = "Тематична";
                break;
            case 'Semester':
                topicText = "Семестр";
                break;
            case 'Final':
                topicText = "Річна";
                break;
            default:
                topicText = lesson.Topic || lesson.lessonType;
        }

        headerRow.innerHTML += `<th><p class="lesson-topic">${topicText}</p><p class="lesson-date">${lesson.Date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    const subjects = [...new Set(grades.map(g => g.Subject))];

    subjects.forEach(subject => {
        const subjectRow = document.createElement('tr');
        subjectRow.innerHTML = `<td>${subject}</td>`;

        // ✅ Виправлення: порівнюємо з `subject`, а не `g`
        const subjectGrades = grades.filter(g => g.Subject === subject);
        lessons.forEach(lesson => {
            const grade = subjectGrades.find(g => `${g.lessonNumber}-${g.lessonType}` === `${lesson.lessonNumber}-${lesson.lessonType}`);
            const gradeValue = grade ? grade.Grade : '';
            subjectRow.innerHTML += `<td>${gradeValue}</td>`;
        });
        tableBody.appendChild(subjectRow);
    });

    table.appendChild(tableBody);
    tableContainer.appendChild(table);
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    tableContainer.innerHTML = '';

    if (!journalData || journalData.length === 0) {
        tableContainer.innerHTML = '<p>Журнал пустий. Немає учнів в класі бази даних.</p>';
        return;
    }

    const students = journalData;

    const allLessons = students.flatMap(s => s.grades || []);

    const uniqueLessons = allLessons.reduce((acc, current) => {
        const uniqueId = `${current.lessonNumber}-${current.lessonType}`;
        if (!acc.find(item => `${item.lessonNumber}-${item.lessonType}` === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => parseInt(a.lessonNumber) - parseInt(b.lessonNumber));

    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Прізвище та Ім'я</th>`;
    uniqueLessons.forEach(lesson => {
        let topicText = lesson.Topic || lesson.lessonType;

        switch (lesson.lessonType) {
            case 'Normal':
                topicText = `Урок ${lesson.lessonNumber}`;
                break;
            case 'Thematic':
                topicText = "Тематична";
                break;
            case 'Semester':
                topicText = "Семестр";
                break;
            case 'Final':
                topicText = "Річна";
                break;
            default:
                topicText = lesson.Topic || lesson.lessonType;
        }

        const date = lesson.Date || ' ';
        headerRow.innerHTML += `<th><p class="lesson-topic">${topicText}</p><p class="lesson-date">${date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    students.forEach(student => {
        const studentRow = document.createElement('tr');
        studentRow.innerHTML = `<td>${student.lastName} ${student.firstName}</td>`;

        // ✅ Нова, правильна логіка: знаходимо останній звичайний урок
        const lastNormalLesson = uniqueLessons.slice().reverse().find(lesson => lesson.lessonType === 'Normal');

        const gradeCells = uniqueLessons.map(lesson => {
            const studentGrade = student.grades.find(g => `${g.lessonNumber}-${g.lessonType}` === `${lesson.lessonNumber}-${lesson.lessonType}`);
            const gradeValue = studentGrade ? studentGrade.Grade : '';

            let cellContent;
            // Умова, що дозволяє відобразити input:
            // Перевіряємо, чи є поточний урок останнім звичайним уроком
            if (lastNormalLesson && `${lesson.lessonNumber}-${lesson.lessonType}` === `${lastNormalLesson.lessonNumber}-${lastNormalLesson.lessonType}`) {
                cellContent = `<input type="text" value="${gradeValue}" class="grade-input" />`;
            } else {
                cellContent = gradeValue;
            }

            return `
                <td
                    class="grade-cell"
                    data-lesson-number="${lesson.lessonNumber}"
                    data-lesson-type="${lesson.lessonType}"
                    data-student-first-name="${student.firstName}"
                    data-student-last-name="${student.lastName}"
                >
                    ${cellContent}
                </td>
            `;
        }).join('');

        studentRow.innerHTML += gradeCells;
        tableBody.appendChild(studentRow);
    });
    table.appendChild(tableBody);

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
// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// Цей файл відповідає за відображення журналу та обробку подій оновлення оцінок.

/*export function displayGrades(grades, role, name) {
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

    const lessons = grades.reduce((acc, current) => {
        const uniqueId = `${current.lessonNumber}-${current.lessonType}`;
        if (!acc.find(item => `${item.lessonNumber}-${item.lessonType}` === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => {
        const numA = parseInt(a.lessonNumber, 10);
        const numB = parseInt(b.lessonNumber, 10);
        return numA - numB;
    });

    lessons.forEach(lesson => {
        let topicText = lesson.Topic || lesson.lessonType;

        switch (lesson.lessonType) {
            case 'Normal':
                topicText = `Урок ${lesson.lessonNumber}`;
                break;
            case 'Thematic':
                topicText = "Тематична";
                break;
            case 'Semester':
                topicText = "Семестр";
                break;
            case 'Final':
                topicText = "Річна";
                break;
            default:
                topicText = lesson.Topic || lesson.lessonType;
        }

        headerRow.innerHTML += `<th><p class="lesson-topic">${topicText}</p><p class="lesson-date">${lesson.Date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    const subjects = [...new Set(grades.map(g => g.Subject))];

    subjects.forEach(subject => {
        const subjectRow = document.createElement('tr');
        subjectRow.innerHTML = `<td>${subject}</td>`;

        // ✅ Виправлено: порівнюємо з `subject`, а не `g`
        const subjectGrades = grades.filter(g => g.Subject === subject);
        lessons.forEach(lesson => {
            const grade = subjectGrades.find(g => `${g.lessonNumber}-${g.lessonType}` === `${lesson.lessonNumber}-${lesson.lessonType}`);
            const gradeValue = grade ? grade.Grade : '';
            subjectRow.innerHTML += `<td>${gradeValue}</td>`;
        });
        tableBody.appendChild(subjectRow);
    });

    table.appendChild(tableBody);
    tableContainer.appendChild(table);
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    tableContainer.innerHTML = '';

    if (!journalData || journalData.length === 0) {
        tableContainer.innerHTML = '<p>Журнал пустий. Немає учнів в класі бази даних.</p>';
        return;
    }

    const students = journalData;

    const allLessons = students.flatMap(s => s.grades || []);

    const uniqueLessons = allLessons.reduce((acc, current) => {
        const uniqueId = `${current.lessonNumber}-${current.lessonType}`;
        if (!acc.find(item => `${item.lessonNumber}-${item.lessonType}` === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => parseInt(a.lessonNumber) - parseInt(b.lessonNumber));

    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Прізвище та Ім'я</th>`;
    uniqueLessons.forEach(lesson => {
        let topicText = lesson.Topic || lesson.lessonType;

        switch (lesson.lessonType) {
            case 'Normal':
                topicText = `Урок ${lesson.lessonNumber}`;
                break;
            case 'Thematic':
                topicText = "Тематична";
                break;
            case 'Semester':
                topicText = "Семестр";
                break;
            case 'Final':
                topicText = "Річна";
                break;
            default:
                topicText = lesson.Topic || lesson.lessonType;
        }

        const date = lesson.Date || ' ';
        headerRow.innerHTML += `<th><p class="lesson-topic">${topicText}</p><p class="lesson-date">${date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    students.forEach(student => {
        const studentRow = document.createElement('tr');
        studentRow.innerHTML = `<td>${student.lastName} ${student.firstName}</td>`;

        const maxLessonIndex = uniqueLessons.length - 1;

        const gradeCells = uniqueLessons.map((lesson, index) => {
            const studentGrade = student.grades.find(g => `${g.lessonNumber}-${g.lessonType}` === `${lesson.lessonNumber}-${lesson.lessonType}`);
            const gradeValue = studentGrade ? studentGrade.Grade : '';
            
            let cellContent;
            if (index === maxLessonIndex && lesson.lessonType === 'Normal') {
                cellContent = `<input type="text" value="${gradeValue}" class="grade-input" />`;
            } else {
                cellContent = gradeValue;
            }

            return `
                <td
                    class="grade-cell"
                    data-lesson-number="${lesson.lessonNumber}"
                    data-lesson-type="${lesson.lessonType}"
                    data-student-first-name="${student.firstName}"
                    data-student-last-name="${student.lastName}"
                >
                    ${cellContent}
                </td>
            `;
        }).join('');
        
        studentRow.innerHTML += gradeCells;
        tableBody.appendChild(studentRow);
    });
    table.appendChild(tableBody);

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
}*/
