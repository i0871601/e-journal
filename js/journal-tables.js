// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// Цей файл відповідає за відображення журналу та обробку подій оновлення оцінок.
// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// Цей файл відповідає за відображення журналу та обробку подій оновлення оцінок.

export function displayGrades(grades, role, name) {
    const tableContainer = document.getElementById("journal-table-container");
    if (!tableContainer) {
        console.error("Елемент 'journal-table-container' не знайдено.");
        return;
    }
    tableContainer.innerHTML = '';
    
    // Створення елементів таблиці
    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Предмет</th>`;
    
    const lessons = grades.reduce((acc, current) => {
        if (!acc.find(item => item.lessonNumber === current.lessonNumber)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => a.lessonNumber - b.lessonNumber);
    
    lessons.forEach(lesson => {
        headerRow.innerHTML += `<th><p class="lesson-topic">${lesson.topic}</p><p class="lesson-date">${lesson.date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    const subjects = [...new Set(grades.map(g => g.subject))];
    
    subjects.forEach(subject => {
        const subjectRow = document.createElement('tr');
        subjectRow.innerHTML = `<td>${subject}</td>`;
        
        const subjectGrades = grades.filter(g => g.subject === subject);
        lessons.forEach(lesson => {
            const grade = subjectGrades.find(g => g.lessonNumber === lesson.lessonNumber);
            const gradeValue = grade ? grade.grade : '';
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

    // ⭐️ Видалено рядок `journalContainer.innerHTML = '';`
    const tableContainer = document.getElementById("journal-table-container");
    if (!tableContainer) {
        console.error("Елемент 'journal-table-container' не знайдено.");
        return;
    }
    // ⭐️ Видалено рядок `tableContainer.innerHTML = '';`

    // Тепер ми будемо додавати таблицю в інший, спеціально створений контейнер
    let gradeTableWrapper = document.getElementById("grade-table-wrapper");
    if (!gradeTableWrapper) {
        gradeTableWrapper = document.createElement('div');
        gradeTableWrapper.id = "grade-table-wrapper";
        tableContainer.appendChild(gradeTableWrapper);
    }
    gradeTableWrapper.innerHTML = ''; // Очищаємо лише обгортку для таблиці

    if (journalData.length === 0) {
        journalContainer.innerHTML = '<p>Журнал пустий. Додайте перший урок.</p>';
        return;
    }

    const students = journalData;
    const lessons = students[0].grades.sort((a, b) => {
        return parseInt(a.lessonNumber) - parseInt(b.lessonNumber);
    });
    
    // Створення елементів таблиці
    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Прізвище та Ім'я</th>`;
    lessons.forEach(lesson => {
        headerRow.innerHTML += `<th><p class="lesson-topic">${lesson.topic}</p><p class="lesson-date">${lesson.date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    students.forEach(student => {
        const studentRow = document.createElement('tr');
        studentRow.innerHTML = `<td>${student.lastName} ${student.firstName}</td>`;
        
        const gradeCells = student.grades.map(grade => {
            return `
                <td 
                    class="grade-cell"
                    data-lesson-number="${grade.lessonNumber}"
                    data-lesson-type="${grade.lessonType}"
                    data-student-first-name="${student.firstName}"
                    data-student-last-name="${student.lastName}"
                >
                    <input type="text" value="${grade.grade}" class="grade-input" />
                </td>
            `;
        }).join('');
        studentRow.innerHTML += gradeCells;
        tableBody.appendChild(studentRow);
    });
    table.appendChild(tableBody);

    gradeTableWrapper.appendChild(table);

    // ⭐️ Обробник подій для всіх полів оцінок
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
/*export function displayGrades(grades, role, name) {
    const tableContainer = document.getElementById("journal-table-container");
    if (!tableContainer) {
        console.error("Елемент 'journal-table-container' не знайдено.");
        return;
    }
    tableContainer.innerHTML = '';
    
    // Створення елементів таблиці
    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Предмет</th>`;
    
    const lessons = grades.reduce((acc, current) => {
        if (!acc.find(item => item.lessonNumber === current.lessonNumber)) {
            acc.push(current);
        }
        return acc;
    }, []).sort((a, b) => a.lessonNumber - b.lessonNumber);
    
    lessons.forEach(lesson => {
        headerRow.innerHTML += `<th><p class="lesson-topic">${lesson.topic}</p><p class="lesson-date">${lesson.date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    const subjects = [...new Set(grades.map(g => g.subject))];
    
    subjects.forEach(subject => {
        const subjectRow = document.createElement('tr');
        subjectRow.innerHTML = `<td>${subject}</td>`;
        
        const subjectGrades = grades.filter(g => g.subject === subject);
        lessons.forEach(lesson => {
            const grade = subjectGrades.find(g => g.lessonNumber === lesson.lessonNumber);
            const gradeValue = grade ? grade.grade : '';
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

    journalContainer.innerHTML = '';
    const tableContainer = document.getElementById("journal-table-container");
    if (!tableContainer) {
        console.error("Елемент 'journal-table-container' не знайдено.");
        return;
    }
    tableContainer.innerHTML = '';

    if (journalData.length === 0) {
        journalContainer.innerHTML = '<p>Журнал пустий. Додайте перший урок.</p>';
        return;
    }

    const students = journalData;
    const lessons = students[0].grades.sort((a, b) => {
        return parseInt(a.lessonNumber) - parseInt(b.lessonNumber);
    });
    
    // Створення елементів таблиці
    const table = document.createElement('table');
    table.classList.add('journal-table');

    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Прізвище та Ім'я</th>`;
    lessons.forEach(lesson => {
        headerRow.innerHTML += `<th><p class="lesson-topic">${lesson.topic}</p><p class="lesson-date">${lesson.date}</p></th>`;
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    students.forEach(student => {
        const studentRow = document.createElement('tr');
        studentRow.innerHTML = `<td>${student.lastName} ${student.firstName}</td>`;
        
        const gradeCells = student.grades.map(grade => {
            return `
                <td 
                    class="grade-cell"
                    data-lesson-number="${grade.lessonNumber}"
                    data-lesson-type="${grade.lessonType}"
                    data-student-first-name="${student.firstName}"
                    data-student-last-name="${student.lastName}"
                >
                    <input type="text" value="${grade.grade}" class="grade-input" />
                </td>
            `;
        }).join('');
        studentRow.innerHTML += gradeCells;
        tableBody.appendChild(studentRow);
    });
    table.appendChild(tableBody);

    tableContainer.appendChild(table);

    // ⭐️ Обробник подій для всіх полів оцінок
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('change', (event) => {
            const newValue = event.target.value;
            const parentCell = event.target.closest('.grade-cell');

            if (parentCell) {
                const lessonNumber = parentCell.dataset.lessonNumber;
                const lessonType = parentCell.dataset.lessonType;
                const studentFirstName = parentCell.dataset.studentFirstName;
                const studentLastName = parentCell.dataset.studentLastName;

                // Викликаємо колбек з усіма даними
                updateGradeCallback(newValue, lessonNumber, studentFirstName, studentLastName, lessonType);
            }
        });
    });
}*/
